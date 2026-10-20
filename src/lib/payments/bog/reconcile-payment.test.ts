import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BogError } from "./errors";
import type { ApplyBogPaymentReceiptInput } from "./process-callback";
import {
  reconcileStoredBogPayment,
  type BogReconciliationPorts,
  type StoredReconciliationOrder,
} from "./reconcile-payment";
import type { BogReceipt } from "./receipt";

const ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
const BANK_ID = "a767a276-cddd-43ec-9db3-9f9b39eee02d";
const LEAK = "LEAKED_RECONCILE_SECRET";

const originalConsoleError = console.error;
console.error = () => {};

function stored(
  overrides: Partial<StoredReconciliationOrder> = {},
): StoredReconciliationOrder {
  return {
    id: ORDER_ID,
    paymentMethod: "online",
    paymentStatus: "pending",
    paymentProvider: "bog",
    providerOrderId: BANK_ID,
    orderStatus: "pending",
    ...overrides,
  };
}

function receipt(overrides: Partial<BogReceipt> = {}): BogReceipt {
  return {
    orderId: BANK_ID,
    externalOrderId: ORDER_ID,
    orderStatusKey: "completed",
    requestAmount: "90.00",
    transferAmount: "90.00",
    refundAmount: "0",
    currencyCode: "GEL",
    ...overrides,
  };
}

function ports(options: {
  read?: BogReconciliationPorts["readOrder"];
  receipt?: BogReceipt | (() => Promise<BogReceipt>);
  apply?: (input: ApplyBogPaymentReceiptInput) => Promise<unknown>;
} = {}): {
  ports: BogReconciliationPorts;
  receiptIds: string[];
  calls: ApplyBogPaymentReceiptInput[];
} {
  const receiptIds: string[] = [];
  const calls: ApplyBogPaymentReceiptInput[] = [];

  return {
    receiptIds,
    calls,
    ports: {
      readOrder: options.read ?? (async () => stored()),
      getReceipt: async (providerOrderId) => {
        receiptIds.push(providerOrderId);
        if (typeof options.receipt === "function") {
          return options.receipt();
        }
        return options.receipt ?? receipt();
      },
      applyReceipt: async (input) => {
        calls.push(input);
        if (options.apply) {
          return options.apply(input);
        }
        return {
          result: "applied_paid",
          order_id: ORDER_ID,
          payment_status: "paid",
        };
      },
    },
  };
}

async function main(): Promise<void> {
  const happy = ports();
  const paid = await reconcileStoredBogPayment(ORDER_ID, happy.ports);
  assert.deepEqual(paid, {
    outcome: "recorded",
    result: "applied_paid",
    paymentStatus: "paid",
  });
  assert.deepEqual(happy.receiptIds, [BANK_ID]);
  assert.deepEqual(happy.calls, [
    {
      orderId: ORDER_ID,
      providerOrderId: BANK_ID,
      externalOrderId: ORDER_ID,
      receiptStatus: "completed",
      requestAmount: "90.00",
      transferAmount: "90.00",
      refundAmount: "0",
      currencyCode: "GEL",
    },
  ]);
  assert.equal(JSON.stringify(paid).includes(LEAK), false);
  assert.equal(JSON.stringify(paid).includes("90.00"), false);

  const missingProvider = ports({
    read: async () => stored({ providerOrderId: null, paymentStatus: "unpaid" }),
  });
  const missing = await reconcileStoredBogPayment(ORDER_ID, missingProvider.ports);
  assert.equal(missing.outcome, "skipped");
  assert.equal(missing.result, "provider_order_missing");
  assert.equal(missing.paymentStatus, null);
  assert.equal(missingProvider.receiptIds.length, 0);
  assert.equal(missingProvider.calls.length, 0);

  const pickup = ports({
    read: async () => stored({ paymentMethod: "pay_at_pickup", providerOrderId: null }),
  });
  assert.equal(
    (await reconcileStoredBogPayment(ORDER_ID, pickup.ports)).result,
    "not_online",
  );
  assert.equal(pickup.receiptIds.length, 0);

  const bankDown = ports({
    receipt: async () => {
      throw new BogError("network", `receipt ${LEAK}`, { status: 503 });
    },
  });
  const unavailable = await reconcileStoredBogPayment(ORDER_ID, bankDown.ports);
  assert.equal(unavailable.outcome, "unavailable");
  assert.equal(bankDown.calls.length, 0);
  assert.equal(JSON.stringify(unavailable).includes(LEAK), false);

  const otherReceipt = ports({
    receipt: receipt({ orderId: "other-bank-order" }),
  });
  assert.equal(
    (await reconcileStoredBogPayment(ORDER_ID, otherReceipt.ports)).result,
    "provider_order_mismatch",
  );
  assert.equal(otherReceipt.calls.length, 0);

  const identity = ports({
    receipt: receipt({ externalOrderId: "11111111-1111-4111-8111-111111111111" }),
    apply: async (input) => {
      identity.calls.push(input);
      return {
        result: "identity_mismatch",
        order_id: ORDER_ID,
        payment_status: "pending",
      };
    },
  });
  const mismatched = await reconcileStoredBogPayment(ORDER_ID, identity.ports);
  assert.equal(mismatched.result, "identity_mismatch");
  assert.equal(mismatched.paymentStatus, "pending");
  assert.equal(
    identity.calls[0]?.externalOrderId,
    "11111111-1111-4111-8111-111111111111",
  );

  const recovered = ports({
    read: async () => stored({ paymentStatus: "pending" }),
    apply: async (input) => {
      recovered.calls.push(input);
      return {
        result: "applied_paid",
        order_id: ORDER_ID,
        payment_status: "paid",
      };
    },
  });
  const firstRecovery = await reconcileStoredBogPayment(ORDER_ID, recovered.ports);
  const secondRecovery = await reconcileStoredBogPayment(ORDER_ID, ports({
    apply: async () => ({
      result: "already_recorded",
      order_id: ORDER_ID,
      payment_status: "paid",
    }),
  }).ports);
  assert.equal(firstRecovery.result, "applied_paid");
  assert.equal(firstRecovery.paymentStatus, "paid");
  assert.equal(secondRecovery.result, "already_recorded");
  assert.equal(secondRecovery.paymentStatus, "paid");
  assert.equal(recovered.calls[0]?.receiptStatus, "completed");

  const rejected = ports({
    receipt: receipt({
      orderStatusKey: "rejected",
      transferAmount: "0",
    }),
    apply: async (input) => {
      rejected.calls.push(input);
      return {
        result: "provider_rejected",
        order_id: ORDER_ID,
        payment_status: "pending",
      };
    },
  });
  const rejection = await reconcileStoredBogPayment(ORDER_ID, rejected.ports);
  assert.equal(rejection.result, "provider_rejected");
  assert.equal(rejection.paymentStatus, "pending");
  assert.equal(rejected.calls[0]?.receiptStatus, "rejected");

  const delayed = ports({
    receipt: receipt({ orderStatusKey: "processing" }),
    apply: async (input) => {
      delayed.calls.push(input);
      return {
        result: "observed",
        order_id: ORDER_ID,
        payment_status: "pending",
      };
    },
  });
  assert.equal(
    (await reconcileStoredBogPayment(ORDER_ID, delayed.ports)).result,
    "observed",
  );
  assert.equal(delayed.calls[0]?.receiptStatus, "processing");

  for (const result of [
    "quarantine_late_completed",
    "amount_mismatch",
    "currency_mismatch",
    "method_mismatch",
    "provider_order_mismatch",
  ]) {
    const held = ports({
      apply: async () => ({
        result,
        order_id: ORDER_ID,
        payment_status: "pending",
      }),
    });
    const outcome = await reconcileStoredBogPayment(ORDER_ID, held.ports);
    assert.equal(outcome.result, result);
    assert.equal(outcome.paymentStatus, "pending");
  }

  const falsePaid = ports({
    apply: async () => ({
      result: "applied_paid",
      order_id: ORDER_ID,
      payment_status: "pending",
    }),
  });
  assert.equal(
    (await reconcileStoredBogPayment(ORDER_ID, falsePaid.ports)).outcome,
    "unavailable",
  );

  const absent = ports({
    read: async () => null,
  });
  assert.equal(
    (await reconcileStoredBogPayment(ORDER_ID, absent.ports)).result,
    "order_not_found",
  );
  assert.equal(absent.receiptIds.length, 0);

  const readFailed = ports({
    read: async () => {
      throw new Error(`database ${LEAK}`);
    },
  });
  const failedRead = await reconcileStoredBogPayment(ORDER_ID, readFailed.ports);
  assert.equal(failedRead.outcome, "unavailable");
  assert.equal(JSON.stringify(failedRead).includes(LEAK), false);
  assert.equal(readFailed.receiptIds.length, 0);

  assert.equal(
    (await reconcileStoredBogPayment("not-a-uuid", ports().ports)).result,
    "order_not_found",
  );

  const sql = readFileSync(
    join(process.cwd(), "docs/sql/reconcile-bog-payment-receipt.sql"),
    "utf8",
  );
  assert.match(sql, /disposition/);
  assert.match(sql, /payment_events_receipt_uidx/);
  assert.doesNotMatch(sql, /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.cancel_order/i);
  assert.doesNotMatch(sql, /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.return_delivery_to_store/i);
  assert.equal(sql.includes("UPDATE public.orders"), false);
  assert.equal(sql.includes("stock"), true);

  const source = readFileSync(
    new URL("./reconcile-payment.ts", import.meta.url),
    "utf8",
  );
  assert.equal(source.includes("getBogReceipt"), true);
  assert.equal(source.includes("apply_bog_payment_receipt"), true);
  assert.equal(source.includes(".update("), false);
  assert.equal(source.includes("cancel_order"), false);
  assert.equal(source.includes("\"use server\""), false);
  assert.equal(source.includes("paymentStatus: \"paid\""), false);
}

main()
  .catch((error: unknown) => {
    console.error = originalConsoleError;
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    console.error = originalConsoleError;
  });
