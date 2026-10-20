import { createAdminClient } from "@/lib/supabase/admin";

import { verifyBogCallbackSignature } from "./callback";
import { BogError } from "./errors";
import { isRecord } from "./http";
import { getBogReceipt, type BogReceipt } from "./receipt";

export const APPLY_BOG_PAYMENT_RECEIPT_RPC = "apply_bog_payment_receipt";

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

const PERMANENT_APPLY_FAILURES = new Set([
  "payment:order_not_found",
  "payment:invalid_receipt",
]);

export type ApplyBogPaymentReceiptInput = {
  orderId: string;
  providerOrderId: string;
  externalOrderId: string;
  receiptStatus: string;
  requestAmount: string;
  transferAmount: string;
  refundAmount: string;
  currencyCode: string;
};

export type BogCallbackPorts = {
  verifySignature: (rawBody: Uint8Array, signature: string) => void;
  getReceipt: (providerOrderId: string) => Promise<BogReceipt>;
  applyReceipt: (input: ApplyBogPaymentReceiptInput) => Promise<unknown>;
};

export type CallbackHttpResult = {
  status: 200 | 400 | 503;
  body: { received: true } | { error: "rejected" | "unavailable" };
};

function rejected(): CallbackHttpResult {
  return { status: 400, body: { error: "rejected" } };
}

function unavailable(): CallbackHttpResult {
  return { status: 503, body: { error: "unavailable" } };
}

function received(): CallbackHttpResult {
  return { status: 200, body: { received: true } };
}

function logCallbackFailure(label: string, error: unknown): void {
  if (error instanceof BogError) {
    console.error(label, {
      kind: error.kind,
      status: error.status ?? null,
    });
    return;
  }

  const code = readPaymentCode(error);
  console.error(label, { code });
}

function readPaymentCode(error: unknown): string | null {
  const message =
    error instanceof Error
      ? error.message
      : isRecord(error) && typeof error.message === "string"
        ? error.message
        : "";
  return message.match(/payment:[a-z0-9_]+/)?.[0] ?? null;
}

function readCallbackProviderOrderId(rawBody: Uint8Array): string | null {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
    const payload: unknown = JSON.parse(text);

    if (
      !isRecord(payload) ||
      payload.event !== "order_payment" ||
      !isRecord(payload.body) ||
      typeof payload.body.order_id !== "string"
    ) {
      return null;
    }

    const orderId = payload.body.order_id.trim();
    return orderId.length > 0 ? orderId : null;
  } catch {
    return null;
  }
}

function receiptFailure(error: unknown): CallbackHttpResult {
  logCallbackFailure("BOG callback receipt failed", error);

  if (error instanceof BogError && error.kind === "malformed") {
    return rejected();
  }

  return unavailable();
}

function applyFailure(error: unknown): CallbackHttpResult {
  const code = readPaymentCode(error);
  logCallbackFailure("BOG callback apply failed", error);

  if (code && PERMANENT_APPLY_FAILURES.has(code)) {
    return rejected();
  }

  return unavailable();
}

function readApplyResult(
  data: unknown,
  orderId: string,
): CallbackHttpResult {
  if (!isRecord(data) || typeof data.result !== "string") {
    console.error("BOG callback apply returned an unexpected result");
    return unavailable();
  }

  if (!RECORDED_RESULTS.has(data.result)) {
    console.error("BOG callback apply returned an unexpected result");
    return unavailable();
  }

  if (typeof data.order_id !== "string" || data.order_id.toLowerCase() !== orderId.toLowerCase()) {
    console.error("BOG callback apply returned an unexpected result");
    return unavailable();
  }

  if (data.result === "applied_paid" && data.payment_status !== "paid") {
    console.error("BOG callback apply returned an unexpected result");
    return unavailable();
  }

  return received();
}

/**
 * Accepts one signed BOG callback. The callback body supplies only the
 * provider order id. Payment status, amounts, and currency come from
 * getBogReceipt. apply_bog_payment_receipt is the lifecycle writer:
 * repeated fingerprints return already_recorded and do not mark paid again.
 */
export async function processBogPaymentCallback(
  rawBody: Uint8Array,
  signature: string,
  ports: BogCallbackPorts = createDefaultPorts(),
): Promise<CallbackHttpResult> {
  try {
    ports.verifySignature(rawBody, signature);
  } catch (error) {
    logCallbackFailure("BOG callback signature failed", error);

    if (error instanceof BogError && error.kind === "configuration") {
      return unavailable();
    }

    return rejected();
  }

  const providerOrderId = readCallbackProviderOrderId(rawBody);

  if (!providerOrderId) {
    return rejected();
  }

  let receipt: BogReceipt;

  try {
    receipt = await ports.getReceipt(providerOrderId);
  } catch (error) {
    return receiptFailure(error);
  }

  if (receipt.orderId !== providerOrderId || !ORDER_UUID.test(receipt.externalOrderId)) {
    return rejected();
  }

  let applied: unknown;

  try {
    applied = await ports.applyReceipt({
      orderId: receipt.externalOrderId,
      providerOrderId: receipt.orderId,
      externalOrderId: receipt.externalOrderId,
      receiptStatus: receipt.orderStatusKey,
      requestAmount: receipt.requestAmount,
      transferAmount: receipt.transferAmount,
      refundAmount: receipt.refundAmount,
      currencyCode: receipt.currencyCode,
    });
  } catch (error) {
    return applyFailure(error);
  }

  return readApplyResult(applied, receipt.externalOrderId);
}

async function applyStoredBogReceipt(
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

function createDefaultPorts(): BogCallbackPorts {
  return {
    verifySignature: verifyBogCallbackSignature,
    getReceipt: getBogReceipt,
    applyReceipt: applyStoredBogReceipt,
  };
}
