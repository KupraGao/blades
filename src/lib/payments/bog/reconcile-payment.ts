import { createAdminClient } from "@/lib/supabase/admin";

import { BogError } from "./errors";
import { isRecord } from "./http";
import {
  APPLY_BOG_PAYMENT_RECEIPT_RPC,
  type ApplyBogPaymentReceiptInput,
} from "./process-callback";
import { assertReceiptOrderId, getBogReceipt, type BogReceipt } from "./receipt";

const ORDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RECORDED_RESULTS = new Set([
  "applied_paid",
  "already_paid",
  "already_recorded",
  "quarantine_late_completed",
  "provider_order_mismatch",
  "provider_order_missing",
  "identity_mismatch",
  "amount_mismatch",
  "currency_mismatch",
  "method_mismatch",
  "provider_rejected",
  "observed_refund",
  "observed",
  "unknown_status",
  "contradictory_state",
]);

export type StoredReconciliationOrder = {
  id: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  paymentProvider: string | null;
  providerOrderId: string | null;
  orderStatus: string | null;
};

export type BogReconciliationPorts = {
  readOrder: (orderId: string) => Promise<StoredReconciliationOrder | null>;
  getReceipt: (providerOrderId: string) => Promise<BogReceipt>;
  applyReceipt: (input: ApplyBogPaymentReceiptInput) => Promise<unknown>;
};

export type BogReconciliationResult = {
  outcome: "recorded" | "skipped" | "unavailable";
  result: string;
  paymentStatus: string | null;
};

function skipped(result: string): BogReconciliationResult {
  return { outcome: "skipped", result, paymentStatus: null };
}

function unavailable(): BogReconciliationResult {
  return { outcome: "unavailable", result: "unavailable", paymentStatus: null };
}

function logReconciliationFailure(error: unknown): void {
  if (error instanceof BogError) {
    console.error("BOG reconciliation failed", {
      kind: error.kind,
      status: error.status ?? null,
    });
    return;
  }

  const message =
    error instanceof Error
      ? error.message
      : isRecord(error) && typeof error.message === "string"
        ? error.message
        : "";
  console.error("BOG reconciliation failed", {
    code: message.match(/payment:[a-z0-9_]+/)?.[0] ?? null,
  });
}

function mapStoredOrder(data: unknown): StoredReconciliationOrder {
  if (!isRecord(data) || typeof data.id !== "string" || !data.id.trim()) {
    throw new Error("order");
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

function readRecordedResult(
  data: unknown,
  orderId: string,
): BogReconciliationResult {
  if (!isRecord(data) || typeof data.result !== "string") {
    return unavailable();
  }

  if (!RECORDED_RESULTS.has(data.result)) {
    return unavailable();
  }

  if (
    typeof data.order_id !== "string" ||
    data.order_id.toLowerCase() !== orderId.toLowerCase()
  ) {
    return unavailable();
  }

  const paymentStatus =
    typeof data.payment_status === "string" ? data.payment_status : null;

  if (data.result === "applied_paid" && paymentStatus !== "paid") {
    return unavailable();
  }

  return {
    outcome: "recorded",
    result: data.result,
    paymentStatus,
  };
}

/**
 * Loads one stored order, fetches its BOG receipt, and submits that receipt
 * to apply_bog_payment_receipt. Browser payment status is not an input.
 * This does not cancel the order or change stock. It is not an HTTP route.
 */
export async function reconcileStoredBogPayment(
  orderId: string,
  ports: BogReconciliationPorts = createDefaultPorts(),
): Promise<BogReconciliationResult> {
  const requestedOrderId = orderId?.trim() ?? "";

  if (!ORDER_UUID.test(requestedOrderId)) {
    return skipped("order_not_found");
  }

  let row: StoredReconciliationOrder | null;

  try {
    row = await ports.readOrder(requestedOrderId);
  } catch (error) {
    logReconciliationFailure(error);
    return unavailable();
  }

  if (!row || row.id.toLowerCase() !== requestedOrderId.toLowerCase()) {
    return skipped("order_not_found");
  }

  if (row.paymentMethod !== "online") {
    return skipped("not_online");
  }

  if ((row.paymentProvider ?? "bog") !== "bog") {
    return skipped("not_online");
  }

  let providerOrderId = "";

  try {
    providerOrderId = assertReceiptOrderId(row.providerOrderId ?? "");
  } catch (error) {
    logReconciliationFailure(error);
    return skipped("provider_order_missing");
  }

  let receipt: BogReceipt;

  try {
    receipt = await ports.getReceipt(providerOrderId);
  } catch (error) {
    logReconciliationFailure(error);
    return unavailable();
  }

  if (receipt.orderId !== providerOrderId) {
    return skipped("provider_order_mismatch");
  }

  try {
    const applied = await ports.applyReceipt({
      orderId: row.id,
      providerOrderId: receipt.orderId,
      externalOrderId: receipt.externalOrderId,
      receiptStatus: receipt.orderStatusKey,
      requestAmount: receipt.requestAmount,
      transferAmount: receipt.transferAmount,
      refundAmount: receipt.refundAmount,
      currencyCode: receipt.currencyCode,
    });

    return readRecordedResult(applied, row.id);
  } catch (error) {
    logReconciliationFailure(error);
    return unavailable();
  }
}

async function readStoredOrder(
  orderId: string,
): Promise<StoredReconciliationOrder | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, payment_method, payment_status, payment_provider, payment_provider_order_id, status",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("BOG reconciliation order read failed", {
      code: error.code ?? null,
    });
    throw new Error("order-read");
  }

  if (!data) {
    return null;
  }

  return mapStoredOrder(data);
}

async function applyStoredReceipt(
  input: ApplyBogPaymentReceiptInput,
): Promise<unknown> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(APPLY_BOG_PAYMENT_RECEIPT_RPC, {
    p_order_id: input.orderId,
    p_provider_order_id: input.providerOrderId,
    p_external_order_id: input.externalOrderId,
    p_receipt_status: input.receiptStatus,
    p_request_amount: input.requestAmount,
    p_transfer_amount: input.transferAmount,
    p_refund_amount: input.refundAmount,
    p_currency_code: input.currencyCode,
    p_reject_reason: null,
  });

  if (error) {
    throw error;
  }

  return data;
}

function createDefaultPorts(): BogReconciliationPorts {
  return {
    readOrder: readStoredOrder,
    getReceipt: getBogReceipt,
    applyReceipt: applyStoredReceipt,
  };
}
