import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BOG_RECEIPT_STATUS_KEYS } from "./receipt";
import {
  ONLINE_FULFILLMENT_BLOCKED_STATUSES,
  PaymentLifecycleError,
  applyRecordedBogReceipt,
  assessOnlineCancellation,
  assessOnlineFulfillment,
  decideBogReceipt,
  moneyEqual,
  type BogReceiptSnapshot,
  type LocalOrderPayment,
} from "./payment-lifecycle";

const ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
const PROVIDER_ID = "bog-order-1";

function order(overrides: Partial<LocalOrderPayment> = {}): LocalOrderPayment {
  return {
    orderId: ORDER_ID,
    paymentMethod: "online",
    paymentStatus: "pending",
    providerOrderId: PROVIDER_ID,
    orderStatus: "pending",
    totalPrice: "90.00",
    ...overrides,
  };
}

function receipt(
  overrides: Partial<BogReceiptSnapshot> = {},
): BogReceiptSnapshot {
  return {
    providerOrderId: PROVIDER_ID,
    externalOrderId: ORDER_ID,
    receiptStatus: "completed",
    requestAmount: "90.00",
    transferAmount: "90.00",
    refundAmount: "0",
    currencyCode: "GEL",
    ...overrides,
  };
}

const completed = decideBogReceipt(order(), receipt());
assert.equal(completed.disposition, "applied_paid");
assert.equal(completed.markPaid, true);
assert.equal(completed.paymentStatus, "paid");

const seen = new Set<string>();
const first = applyRecordedBogReceipt(order(), receipt(), seen);
assert.equal(first.decision.disposition, "applied_paid");
seen.add(first.recordKey);
const second = applyRecordedBogReceipt(first.order, receipt(), seen);
assert.equal(second.decision.disposition, "already_paid");
assert.equal(second.decision.markPaid, false);
assert.equal(second.order.paymentStatus, "paid");
assert.equal(second.order, first.order);
seen.add(second.recordKey);
const third = applyRecordedBogReceipt(second.order, receipt(), seen);
assert.equal(third.decision.disposition, "already_recorded");
assert.equal(third.decision.markPaid, false);
assert.equal(third.order, second.order);

const blockedSeen = new Set<string>();
const blocked = applyRecordedBogReceipt(
  order({ providerOrderId: null, paymentStatus: "unpaid" }),
  receipt(),
  blockedSeen,
);
assert.equal(blocked.decision.disposition, "provider_order_missing");
assert.equal(blocked.decision.markPaid, false);
blockedSeen.add(blocked.recordKey);
const recovered = applyRecordedBogReceipt(
  {
    ...blocked.order,
    paymentStatus: "pending",
    providerOrderId: PROVIDER_ID,
  },
  receipt(),
  blockedSeen,
);
assert.equal(recovered.decision.disposition, "applied_paid");
assert.equal(recovered.decision.markPaid, true);
assert.equal(recovered.order.paymentStatus, "paid");

const sameMoneyDifferentText = applyRecordedBogReceipt(
  first.order,
  receipt({ requestAmount: "90", transferAmount: "90.0" }),
  seen,
);
assert.equal(sameMoneyDifferentText.decision.disposition, "already_paid");
assert.equal(sameMoneyDifferentText.decision.markPaid, false);
assert.equal(moneyEqual("90", "90.00"), true);
assert.equal(moneyEqual("90.00", "90.0"), true);
assert.equal(moneyEqual("90.00", "89.99"), false);

const mismatchedProvider = decideBogReceipt(
  order(),
  receipt({ providerOrderId: "bog-order-2" }),
);
assert.equal(mismatchedProvider.disposition, "provider_order_mismatch");
assert.equal(mismatchedProvider.markPaid, false);

const missingProvider = decideBogReceipt(
  order({ providerOrderId: null, paymentStatus: "unpaid" }),
  receipt(),
);
assert.equal(missingProvider.disposition, "provider_order_missing");
assert.equal(missingProvider.markPaid, false);

const wrongAmount = decideBogReceipt(
  order(),
  receipt({ requestAmount: "90.00", transferAmount: "80.00" }),
);
assert.equal(wrongAmount.disposition, "amount_mismatch");
assert.equal(wrongAmount.paymentStatus, "pending");

const wrongRequest = decideBogReceipt(
  order(),
  receipt({ requestAmount: "80.00", transferAmount: "80.00" }),
);
assert.equal(wrongRequest.disposition, "amount_mismatch");

const wrongCurrency = decideBogReceipt(
  order(),
  receipt({ currencyCode: "USD" }),
);
assert.equal(wrongCurrency.disposition, "currency_mismatch");
assert.equal(wrongCurrency.markPaid, false);

assert.equal(
  assessOnlineCancellation({
    paymentMethod: "online",
    paymentStatus: "pending",
    providerOrderId: PROVIDER_ID,
  }),
  "blocked_in_progress",
);
assert.equal(
  assessOnlineCancellation({
    paymentMethod: "online",
    paymentStatus: "unpaid",
    providerOrderId: PROVIDER_ID,
  }),
  "blocked_in_progress",
);

assert.equal(
  assessOnlineCancellation({
    paymentMethod: "online",
    paymentStatus: "paid",
    providerOrderId: PROVIDER_ID,
  }),
  "blocked_paid",
);
assert.equal(
  assessOnlineCancellation({
    paymentMethod: "online",
    paymentStatus: "refund_pending",
    providerOrderId: PROVIDER_ID,
  }),
  "blocked_paid",
);

const late = decideBogReceipt(
  order({ orderStatus: "cancelled", paymentStatus: "pending" }),
  receipt(),
);
assert.equal(late.disposition, "quarantine_late_completed");
assert.equal(late.markPaid, false);
assert.equal(late.paymentStatus, "pending");

const lateSeen = new Set<string>();
const lateFirst = applyRecordedBogReceipt(
  order({ orderStatus: "cancelled" }),
  receipt(),
  lateSeen,
);
lateSeen.add(lateFirst.recordKey);
const lateSecond = applyRecordedBogReceipt(
  lateFirst.order,
  receipt(),
  lateSeen,
);
assert.equal(lateSecond.decision.disposition, "already_recorded");
assert.equal(lateSecond.order.orderStatus, "cancelled");
assert.notEqual(lateSecond.order.paymentStatus, "paid");

assert.equal(
  assessOnlineFulfillment({
    paymentMethod: "online",
    paymentStatus: "unpaid",
    nextStatus: "shipped",
  }),
  "blocked_unpaid",
);
assert.equal(
  assessOnlineFulfillment({
    paymentMethod: "online",
    paymentStatus: "pending",
    nextStatus: "ready_for_pickup",
  }),
  "blocked_unpaid",
);
assert.equal(
  assessOnlineFulfillment({
    paymentMethod: "online",
    paymentStatus: "paid",
    nextStatus: "shipped",
  }),
  "allowed",
);

assert.equal(
  assessOnlineCancellation({
    paymentMethod: "pay_at_pickup",
    paymentStatus: "unpaid",
    providerOrderId: null,
  }),
  "allowed",
);
assert.equal(
  assessOnlineFulfillment({
    paymentMethod: "pay_at_pickup",
    paymentStatus: "unpaid",
    nextStatus: "ready_for_pickup",
  }),
  "allowed",
);
assert.equal(
  assessOnlineFulfillment({
    paymentMethod: "pay_at_pickup",
    paymentStatus: "unpaid",
    nextStatus: "completed",
  }),
  "allowed",
);
assert.equal(
  assessOnlineCancellation({
    paymentMethod: "online",
    paymentStatus: "unpaid",
    providerOrderId: null,
  }),
  "allowed",
);

const rejected = decideBogReceipt(order(), receipt({ receiptStatus: "rejected" }));
assert.equal(rejected.disposition, "provider_rejected");
assert.equal(rejected.paymentStatus, "pending");
assert.equal(rejected.markPaid, false);

const refunded = decideBogReceipt(
  order({ paymentStatus: "paid" }),
  receipt({ receiptStatus: "refunded", refundAmount: "90.00" }),
);
assert.equal(refunded.disposition, "observed_refund");
assert.equal(refunded.paymentStatus, "paid");

const unknown = decideBogReceipt(
  order(),
  receipt({ receiptStatus: "settled" }),
);
assert.equal(unknown.disposition, "unknown_status");
assert.equal(unknown.markPaid, false);

assert.throws(
  () => decideBogReceipt(order(), receipt({ requestAmount: "90.001 GEL" })),
  (error: unknown) =>
    error instanceof PaymentLifecycleError &&
    error.code === "payment:invalid_receipt",
);

const sql = readFileSync(
  join(process.cwd(), "docs/sql/add-bog-payment-lifecycle.sql"),
  "utf8",
);
assert.doesNotMatch(
  sql,
  /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.cancel_order/i,
);
assert.doesNotMatch(
  sql,
  /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.return_delivery_to_store/i,
);
assert.match(sql, /quarantine_late_completed/);
assert.match(sql, /payment:online_cancel_blocked/);
assert.match(sql, /payment:unpaid_online_fulfillment/);
for (const status of ONLINE_FULFILLMENT_BLOCKED_STATUSES) {
  assert.match(sql, new RegExp(`'${status}'`));
}
for (const status of BOG_RECEIPT_STATUS_KEYS) {
  assert.match(sql, new RegExp(`'${status}'`));
}
