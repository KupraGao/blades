import { getBogAccessToken } from "./auth";
import { BOG_CREATE_ORDER_URL, assertBogServerOnly } from "./config";
import { providerFailure, isRecord, readJsonBody } from "./http";

export const BOG_RECEIPT_STATUS_KEYS = [
  "created",
  "processing",
  "completed",
  "rejected",
  "refund_requested",
  "refunded",
  "refunded_partially",
  "auth_requested",
  "blocked",
  "partial_completed",
] as const;

export type BogReceiptStatus = (typeof BOG_RECEIPT_STATUS_KEYS)[number];

export type BogReceipt = {
  orderId: string;
  externalOrderId: string;
  orderStatusKey: BogReceiptStatus;
  requestAmount: string;
  transferAmount: string;
  refundAmount: string;
  currencyCode: string;
};

// Path safety for this helper, not a BOG-documented id format.
// One segment, 1–128 characters: letters, digits, "_" and "-".
const RECEIPT_ORDER_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const AMOUNT_TEXT = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function invalid(label: string): never {
  throw providerFailure(
    "malformed",
    `BOG receipt ${label} is invalid.`,
  );
}

export function assertReceiptOrderId(orderId: string): string {
  const trimmed = orderId?.trim() ?? "";

  if (!trimmed || !RECEIPT_ORDER_ID.test(trimmed)) {
    invalid("order_id");
  }

  return trimmed;
}

function readAmount(value: unknown, label: string): string {
  if (typeof value !== "string" || !AMOUNT_TEXT.test(value)) {
    invalid(label);
  }

  return value;
}

export function readBogReceipt(payload: unknown, requestedOrderId: string): BogReceipt {
  if (!isRecord(payload)) {
    invalid("response");
  }

  if (typeof payload.order_id !== "string" || payload.order_id.trim() !== requestedOrderId) {
    invalid("order_id");
  }

  if (typeof payload.external_order_id !== "string" || !payload.external_order_id.trim()) {
    invalid("external_order_id");
  }

  if (!isRecord(payload.order_status) || typeof payload.order_status.key !== "string") {
    invalid("order_status.key");
  }

  const orderStatusKey = payload.order_status.key;
  if (!(BOG_RECEIPT_STATUS_KEYS as readonly string[]).includes(orderStatusKey)) {
    invalid("order_status.key");
  }

  if (!isRecord(payload.purchase_units)) {
    invalid("purchase_units");
  }

  const currencyCode = payload.purchase_units.currency_code;
  if (typeof currencyCode !== "string" || !/^[A-Z]{3}$/.test(currencyCode)) {
    invalid("purchase_units.currency_code");
  }

  return {
    orderId: payload.order_id.trim(),
    externalOrderId: payload.external_order_id.trim(),
    orderStatusKey: orderStatusKey as BogReceiptStatus,
    requestAmount: readAmount(
      payload.purchase_units.request_amount,
      "purchase_units.request_amount",
    ),
    transferAmount: readAmount(
      payload.purchase_units.transfer_amount,
      "purchase_units.transfer_amount",
    ),
    refundAmount: readAmount(
      payload.purchase_units.refund_amount,
      "purchase_units.refund_amount",
    ),
    currencyCode,
  };
}

function receiptUrl(orderId: string): string {
  const origin = new URL(BOG_CREATE_ORDER_URL).origin;
  return `${origin}/payments/v1/receipt/${encodeURIComponent(orderId)}`;
}

export async function getBogReceipt(orderId: string): Promise<BogReceipt> {
  assertBogServerOnly();

  const validatedOrderId = assertReceiptOrderId(orderId);
  const accessToken = await getBogAccessToken();
  let response: Response;

  try {
    response = await fetch(receiptUrl(validatedOrderId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  } catch (cause) {
    throw providerFailure(
      "network",
      "BOG receipt request failed.",
      undefined,
      cause,
    );
  }

  if (!response.ok) {
    await response.text().catch(() => "");
    throw providerFailure(
      response.status === 401 || response.status === 403
        ? "authentication"
        : "network",
      "BOG receipt request failed.",
      response.status,
    );
  }

  const payload = await readJsonBody(response);
  return readBogReceipt(payload, validatedOrderId);
}
