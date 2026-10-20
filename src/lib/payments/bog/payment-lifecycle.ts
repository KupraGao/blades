// Offline contract for docs/sql/add-bog-payment-lifecycle.sql.
// The SQL function is the database authority after that migration is applied.
// This module does not call BOG and does not write orders.

const AMOUNT_TEXT = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

const PROVIDER_ORDER_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const KNOWN_RECEIPT_STATUSES = [
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

const REFUND_OBSERVATIONS = new Set<string>([
  "refund_requested",
  "refunded",
  "refunded_partially",
]);

const OPEN_OBSERVATIONS = new Set<string>([
  "created",
  "processing",
  "auth_requested",
  "blocked",
  "partial_completed",
]);

const CLOSED_ORDER_STATUSES = new Set<string>([
  "cancelled",
  "returned_to_store",
]);

export const ONLINE_FULFILLMENT_BLOCKED_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "ready_for_pickup",
  "completed",
  "delivery_failed",
] as const;

const FULFILLMENT_BLOCKED = new Set<string>(
  ONLINE_FULFILLMENT_BLOCKED_STATUSES,
);

export type PaymentDisposition =
  | "applied_paid"
  | "already_paid"
  | "already_recorded"
  | "quarantine_late_completed"
  | "provider_order_mismatch"
  | "provider_order_missing"
  | "identity_mismatch"
  | "amount_mismatch"
  | "currency_mismatch"
  | "method_mismatch"
  | "provider_rejected"
  | "observed_refund"
  | "observed"
  | "unknown_status"
  | "contradictory_state";

export type LocalOrderPayment = {
  orderId: string;
  paymentMethod: string | null;
  paymentStatus: string;
  providerOrderId: string | null;
  orderStatus: string;
  totalPrice: string;
};

export type BogReceiptSnapshot = {
  providerOrderId: string;
  externalOrderId: string;
  receiptStatus: string;
  requestAmount: string;
  transferAmount: string;
  refundAmount: string;
  currencyCode: string;
};

export type ReceiptDecision = {
  disposition: PaymentDisposition;
  paymentStatus: string;
  markPaid: boolean;
};

export type OnlineCancellationDecision =
  | "allowed"
  | "blocked_in_progress"
  | "blocked_paid";

export type OnlineFulfillmentDecision = "allowed" | "blocked_unpaid";

export class PaymentLifecycleError extends Error {
  readonly code: "payment:invalid_receipt";

  constructor(code: "payment:invalid_receipt") {
    super(code);
    this.name = "PaymentLifecycleError";
    this.code = code;
  }
}

function invalidReceipt(): never {
  throw new PaymentLifecycleError("payment:invalid_receipt");
}

function moneyParts(
  value: string,
): { whole: bigint; fraction: bigint; scale: bigint } | null {
  if (!AMOUNT_TEXT.test(value)) {
    return null;
  }

  const [wholeText, fractionText = ""] = value.split(".");
  const scale = BigInt(10) ** BigInt(fractionText.length);

  return {
    whole: BigInt(wholeText),
    fraction: BigInt(fractionText || "0"),
    scale,
  };
}

export function moneyEqual(left: string, right: string): boolean {
  const a = moneyParts(left);
  const b = moneyParts(right);

  if (!a || !b) {
    return false;
  }

  return (
    a.whole * a.scale * b.scale + a.fraction * b.scale ===
    b.whole * a.scale * b.scale + b.fraction * a.scale
  );
}

export function receiptFingerprint(receipt: BogReceiptSnapshot): string {
  return [
    "bog",
    receipt.providerOrderId.trim(),
    receipt.externalOrderId.trim().toLowerCase(),
    receipt.receiptStatus.trim(),
    receipt.requestAmount.trim(),
    receipt.transferAmount.trim(),
    receipt.refundAmount.trim(),
    receipt.currencyCode.trim(),
  ].join("\n");
}

function assertSnapshot(receipt: BogReceiptSnapshot): BogReceiptSnapshot {
  const providerOrderId = receipt.providerOrderId?.trim() ?? "";
  const externalOrderId = receipt.externalOrderId?.trim() ?? "";
  const receiptStatus = receipt.receiptStatus?.trim() ?? "";
  const requestAmount = receipt.requestAmount?.trim() ?? "";
  const transferAmount = receipt.transferAmount?.trim() ?? "";
  const refundAmount = receipt.refundAmount?.trim() ?? "";
  const currencyCode = receipt.currencyCode?.trim() ?? "";

  if (
    !PROVIDER_ORDER_ID.test(providerOrderId) ||
    !externalOrderId ||
    !receiptStatus ||
    !moneyParts(requestAmount) ||
    !moneyParts(transferAmount) ||
    !moneyParts(refundAmount) ||
    !/^[A-Z]{3}$/.test(currencyCode)
  ) {
    invalidReceipt();
  }

  return {
    providerOrderId,
    externalOrderId,
    receiptStatus,
    requestAmount,
    transferAmount,
    refundAmount,
    currencyCode,
  };
}

function sameOrder(orderId: string, externalOrderId: string): boolean {
  return orderId.trim().toLowerCase() === externalOrderId.trim().toLowerCase();
}

export function decideBogReceipt(
  order: LocalOrderPayment,
  receipt: BogReceiptSnapshot,
): ReceiptDecision {
  const snapshot = assertSnapshot(receipt);
  const unchanged = (disposition: PaymentDisposition): ReceiptDecision => ({
    disposition,
    paymentStatus: order.paymentStatus,
    markPaid: false,
  });

  if (!sameOrder(order.orderId, snapshot.externalOrderId)) {
    return unchanged("identity_mismatch");
  }

  const storedProviderId = order.providerOrderId?.trim() ?? "";

  if (!storedProviderId) {
    return unchanged("provider_order_missing");
  }

  if (storedProviderId !== snapshot.providerOrderId) {
    return unchanged("provider_order_mismatch");
  }

  if (
    snapshot.receiptStatus === "completed" &&
    CLOSED_ORDER_STATUSES.has(order.orderStatus)
  ) {
    return unchanged("quarantine_late_completed");
  }

  if (snapshot.receiptStatus === "completed" && order.paymentMethod !== "online") {
    return unchanged("method_mismatch");
  }

  if (snapshot.receiptStatus === "completed" && snapshot.currencyCode !== "GEL") {
    return unchanged("currency_mismatch");
  }

  if (
    snapshot.receiptStatus === "completed" &&
    (!moneyEqual(snapshot.requestAmount, order.totalPrice) ||
      !moneyEqual(snapshot.transferAmount, snapshot.requestAmount))
  ) {
    return unchanged("amount_mismatch");
  }

  if (snapshot.receiptStatus === "completed" && order.paymentStatus === "paid") {
    return unchanged("already_paid");
  }

  if (
    snapshot.receiptStatus === "completed" &&
    (order.paymentStatus === "unpaid" || order.paymentStatus === "pending")
  ) {
    return {
      disposition: "applied_paid",
      paymentStatus: "paid",
      markPaid: true,
    };
  }

  if (snapshot.receiptStatus === "completed") {
    return unchanged("contradictory_state");
  }

  if (snapshot.receiptStatus === "rejected") {
    return unchanged("provider_rejected");
  }

  if (REFUND_OBSERVATIONS.has(snapshot.receiptStatus)) {
    return unchanged("observed_refund");
  }

  if (OPEN_OBSERVATIONS.has(snapshot.receiptStatus)) {
    return unchanged("observed");
  }

  if (!(KNOWN_RECEIPT_STATUSES as readonly string[]).includes(snapshot.receiptStatus)) {
    return unchanged("unknown_status");
  }

  return unchanged("unknown_status");
}

export function applyRecordedBogReceipt(
  order: LocalOrderPayment,
  receipt: BogReceiptSnapshot,
  seenFingerprints: ReadonlySet<string>,
): {
  order: LocalOrderPayment;
  decision: ReceiptDecision;
  fingerprint: string;
} {
  const snapshot = assertSnapshot(receipt);
  const fingerprint = receiptFingerprint(snapshot);

  if (seenFingerprints.has(fingerprint)) {
    return {
      order,
      fingerprint,
      decision: {
        disposition: "already_recorded",
        paymentStatus: order.paymentStatus,
        markPaid: false,
      },
    };
  }

  const decision = decideBogReceipt(order, snapshot);

  if (!decision.markPaid) {
    return { order, decision, fingerprint };
  }

  return {
    fingerprint,
    decision,
    order: {
      ...order,
      paymentStatus: "paid",
    },
  };
}

export function assessOnlineCancellation(input: {
  paymentMethod: string | null;
  paymentStatus: string | null;
  providerOrderId: string | null;
}): OnlineCancellationDecision {
  if (input.paymentMethod !== "online") {
    return "allowed";
  }

  const paymentStatus = input.paymentStatus?.trim() ?? "";
  const providerOrderId = input.providerOrderId?.trim() ?? "";

  if (
    paymentStatus === "paid" ||
    paymentStatus === "refund_pending" ||
    paymentStatus === "refunded"
  ) {
    return "blocked_paid";
  }

  if (paymentStatus === "pending" || providerOrderId.length > 0) {
    return "blocked_in_progress";
  }

  if (paymentStatus === "unpaid" || paymentStatus === "failed") {
    return "allowed";
  }

  return "blocked_in_progress";
}

export function assessOnlineFulfillment(input: {
  paymentMethod: string | null;
  paymentStatus: string | null;
  nextStatus: string;
}): OnlineFulfillmentDecision {
  if (input.paymentMethod !== "online") {
    return "allowed";
  }

  if (!FULFILLMENT_BLOCKED.has(input.nextStatus)) {
    return "allowed";
  }

  if (input.paymentStatus === "paid") {
    return "allowed";
  }

  return "blocked_unpaid";
}
