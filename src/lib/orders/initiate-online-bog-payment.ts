import { orderError } from "@/lib/i18n/localize-storefront-message";
import {
  readBankOrderDispatch,
  tagBankOrderDispatch,
} from "@/lib/payments/bog/bank-order-dispatch";
import { createOnlineBogOrder } from "@/lib/orders/prepare-bog-create-order";
import { BogError } from "@/lib/payments/bog/errors";
import { isRecord } from "@/lib/payments/bog/http";
import { getBogPaymentRedirectHost } from "@/lib/payments/bog/config";
import { readBankPaymentRedirectUrl } from "@/lib/payments/bog/payment-redirect";
import type { BogCreateOrderResult } from "@/lib/payments/bog/create-order";
import { createAdminClient } from "@/lib/supabase/admin";

export const ATTACH_BOG_PROVIDER_ORDER_RPC = "attach_bog_provider_order";

const PROVIDER_ORDER_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const ATTACH_FAILURES = {
  "payment:invalid_provider_order_id": "orderErrorPaymentStartFailed",
  "payment:order_not_found": "orderErrorPaymentAttachFailed",
  "payment:not_online": "orderErrorPaymentUnavailable",
  "payment:order_closed": "orderErrorPaymentUnavailable",
  "payment:provider_order_conflict": "orderErrorPaymentConflict",
  "payment:not_unpaid": "orderErrorPaymentAlreadyStarted",
  "payment:attach_conflict": "orderErrorPaymentAttachFailed",
} as const;

type AttachFailureCode = keyof typeof ATTACH_FAILURES;

export type StoredOrderPaymentRow = {
  id: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  paymentProvider: string | null;
  providerOrderId: string | null;
  orderStatus: string | null;
};

export type OnlinePaymentRedirect = {
  orderId: string;
  redirectUrl: string;
};

export type OnlineBogPaymentPorts = {
  readOrderPayment: (orderId: string) => Promise<StoredOrderPaymentRow | null>;
  createBankOrder: (orderId: string) => Promise<BogCreateOrderResult>;
  attachProviderOrder: (
    orderId: string,
    providerOrderId: string,
  ) => Promise<unknown>;
  isRedirectAllowed: (redirectUrl: string) => boolean;
};

function isStorefrontOrderError(error: unknown): error is Error {
  return error instanceof Error && error.message.startsWith("orderError");
}

function logInitiationFailure(error: unknown): void {
  if (error instanceof BogError) {
    console.error("online BOG payment initiation failed", {
      kind: error.kind,
      status: error.status ?? null,
    });
    return;
  }

  console.error("online BOG payment initiation failed");
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return "";
}

export function readBogProviderOrderId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!PROVIDER_ORDER_ID.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function mapStoredOrderPayment(
  data: unknown,
): StoredOrderPaymentRow {
  if (!isRecord(data) || typeof data.id !== "string" || !data.id.trim()) {
    throw orderError("orderErrorPaymentStartFailed");
  }

  return {
    id: data.id.trim(),
    paymentMethod:
      typeof data.payment_method === "string" ? data.payment_method : null,
    paymentStatus:
      typeof data.payment_status === "string" ? data.payment_status : null,
    paymentProvider:
      typeof data.payment_provider === "string" ? data.payment_provider : null,
    providerOrderId:
      typeof data.payment_provider_order_id === "string"
        ? data.payment_provider_order_id.trim() || null
        : null,
    orderStatus: typeof data.status === "string" ? data.status : null,
  };
}

function assertEligible(row: StoredOrderPaymentRow): string | null {
  if (row.paymentMethod !== "online") {
    throw orderError("orderErrorPaymentUnavailable");
  }

  if (
    row.orderStatus === "cancelled" ||
    row.orderStatus === "returned_to_store"
  ) {
    throw orderError("orderErrorPaymentUnavailable");
  }

  const provider = row.paymentProvider?.trim() || null;

  if (provider && provider !== "bog") {
    throw orderError("orderErrorPaymentUnavailable");
  }

  const paymentStatus = row.paymentStatus?.trim() || "";
  const existingProviderId = row.providerOrderId
    ? readBogProviderOrderId(row.providerOrderId)
    : null;

  if (row.providerOrderId && !existingProviderId) {
    throw orderError("orderErrorPaymentConflict");
  }

  if (
    paymentStatus === "paid" ||
    paymentStatus === "refund_pending" ||
    paymentStatus === "refunded"
  ) {
    throw orderError("orderErrorPaymentAlreadyStarted");
  }

  if (existingProviderId) {
    if (paymentStatus !== "pending" && paymentStatus !== "unpaid") {
      throw orderError("orderErrorPaymentAlreadyStarted");
    }

    return existingProviderId;
  }

  if (paymentStatus !== "unpaid") {
    throw orderError(
      paymentStatus === "pending"
        ? "orderErrorPaymentAlreadyStarted"
        : "orderErrorPaymentUnavailable",
    );
  }

  return null;
}

export function parseAttachBogProviderOrderResult(data: unknown): {
  result: "attached" | "already_attached";
  orderId: string;
  paymentStatus: "pending";
} {
  if (!isRecord(data)) {
    throw orderError("orderErrorPaymentAttachFailed");
  }

  const result = data.result;
  const orderId = typeof data.order_id === "string" ? data.order_id.trim() : "";
  const paymentStatus =
    typeof data.payment_status === "string" ? data.payment_status.trim() : "";

  if (
    (result !== "attached" && result !== "already_attached") ||
    !orderId ||
    !paymentStatus
  ) {
    throw orderError("orderErrorPaymentAttachFailed");
  }

  if (paymentStatus !== "pending") {
    throw orderError("orderErrorPaymentAlreadyStarted");
  }

  return {
    result,
    orderId,
    paymentStatus,
  };
}

function mapAttachFailure(error: unknown): never {
  const matched = readErrorMessage(error).match(/payment:[a-z0-9_]+/);
  const code = matched?.[0] ?? "";
  const storefrontCode =
    code in ATTACH_FAILURES
      ? ATTACH_FAILURES[code as AttachFailureCode]
      : "orderErrorPaymentAttachFailed";

  console.error("attach_bog_provider_order failed", {
    code: code || null,
  });
  throw orderError(storefrontCode);
}

function readInitiatedBankPayment(result: BogCreateOrderResult): {
  providerOrderId: string;
  redirectUrl: string;
} {
  const providerOrderId = readBogProviderOrderId(result?.orderId);
  const redirectUrl = readBankPaymentRedirectUrl(result?.redirectUrl);

  if (!providerOrderId || !redirectUrl) {
    throw orderError("orderErrorPaymentStartFailed");
  }

  return { providerOrderId, redirectUrl };
}

/**
 * Starts one online BOG payment for an order that already exists.
 * The amount, currency, and basket come from the saved order through
 * createOnlineBogOrder. That helper also reuses the order id as the BOG
 * Idempotency-Key. A stored provider order id is compared with the bank
 * response: a different id is not attached and does not redirect.
 * The bank URL is returned only after attach_bog_provider_order accepts
 * the same provider order id. This does not mark the order paid, cancel
 * it, or change stock.
 */
export async function runOnlineBogPaymentInitiation(
  orderId: string,
  ports: OnlineBogPaymentPorts,
): Promise<OnlinePaymentRedirect> {
  const requestedOrderId = orderId?.trim() ?? "";

  if (!requestedOrderId) {
    throw orderError("orderErrorPaymentStartFailed");
  }

  let row: StoredOrderPaymentRow | null;

  try {
    row = await ports.readOrderPayment(requestedOrderId);
  } catch (error) {
    if (isStorefrontOrderError(error)) {
      throw error;
    }

    logInitiationFailure(error);
    throw orderError("orderErrorPaymentStartFailed");
  }

  if (!row || row.id !== requestedOrderId) {
    throw orderError("orderErrorPaymentStartFailed");
  }

  const existingProviderId = assertEligible(row);

  let bankResult: BogCreateOrderResult;

  try {
    bankResult = await ports.createBankOrder(row.id);
  } catch (error) {
    if (isStorefrontOrderError(error)) {
      throw error;
    }

    logInitiationFailure(error);
    const failure = orderError("orderErrorPaymentStartFailed");
    const dispatch = readBankOrderDispatch(error);

    if (dispatch) {
      tagBankOrderDispatch(failure, dispatch);
    }

    throw failure;
  }

  const bank = readInitiatedBankPayment(bankResult);

  let redirectAllowed = false;

  try {
    redirectAllowed = ports.isRedirectAllowed(bank.redirectUrl);
  } catch (error) {
    logInitiationFailure(error);
    throw orderError("orderErrorPaymentStartFailed");
  }

  if (!redirectAllowed) {
    throw orderError("orderErrorPaymentStartFailed");
  }

  if (existingProviderId && existingProviderId !== bank.providerOrderId) {
    throw orderError("orderErrorPaymentConflict");
  }

  let attached: ReturnType<typeof parseAttachBogProviderOrderResult>;

  try {
    attached = parseAttachBogProviderOrderResult(
      await ports.attachProviderOrder(row.id, bank.providerOrderId),
    );
  } catch (error) {
    if (isStorefrontOrderError(error)) {
      throw error;
    }

    throw mapAttachFailure(error);
  }

  if (attached.orderId !== row.id) {
    throw orderError("orderErrorPaymentAttachFailed");
  }

  return {
    orderId: row.id,
    redirectUrl: bank.redirectUrl,
  };
}

async function readStoredOrderPayment(
  orderId: string,
): Promise<StoredOrderPaymentRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, payment_method, payment_status, payment_provider, payment_provider_order_id, status",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("online BOG payment order read failed", {
      code: error.code ?? null,
    });
    throw orderError("orderErrorPaymentStartFailed");
  }

  if (!data) {
    return null;
  }

  return mapStoredOrderPayment(data);
}

async function attachStoredProviderOrder(
  orderId: string,
  providerOrderId: string,
): Promise<unknown> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(ATTACH_BOG_PROVIDER_ORDER_RPC, {
    p_order_id: orderId,
    p_provider_order_id: providerOrderId,
  });

  if (error) {
    throw error;
  }

  return data;
}

function createDefaultPorts(): OnlineBogPaymentPorts {
  return {
    readOrderPayment: readStoredOrderPayment,
    createBankOrder: (orderId) => createOnlineBogOrder(orderId),
    attachProviderOrder: attachStoredProviderOrder,
    isRedirectAllowed(redirectUrl) {
      return new URL(redirectUrl).hostname === getBogPaymentRedirectHost();
    },
  };
}

export async function initiateOnlineBogPayment(
  orderId: string,
  ports: OnlineBogPaymentPorts = createDefaultPorts(),
): Promise<OnlinePaymentRedirect> {
  return runOnlineBogPaymentInitiation(orderId, ports);
}
