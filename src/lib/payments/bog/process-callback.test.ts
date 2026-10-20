import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { readFileSync } from "node:fs";

import { verifyBogCallbackSignature } from "./callback";
import { BogError } from "./errors";
import {
  APPLY_BOG_PAYMENT_RECEIPT_RPC,
  processBogPaymentCallback,
  type ApplyBogPaymentReceiptInput,
  type BogCallbackPorts,
} from "./process-callback";
import type { BogReceipt } from "./receipt";

const ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
const BANK_ID = "a767a276-cddd-43ec-9db3-9f9b39eee02d";
const LEAK = "LEAKED_CALLBACK_SECRET";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

const originalConsoleError = console.error;
console.error = () => {};

function callbackBody(overrides: Record<string, unknown> = {}): Uint8Array {
  return new TextEncoder().encode(
    JSON.stringify({
      event: "order_payment",
      zoned_request_time: "2022-11-23T18:06:37.240559Z",
      body: {
        order_id: BANK_ID,
        order_status: { key: "completed" },
        purchase_units: {
          request_amount: "1.00",
          transfer_amount: "1.00",
          currency_code: "USD",
        },
        note: LEAK,
        ...overrides,
      },
    }),
  );
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

function applied(
  result: string,
  paymentStatus = result === "applied_paid" ? "paid" : "pending",
) {
  return {
    result,
    order_id: ORDER_ID,
    payment_status: paymentStatus,
    event_id: "event-1",
  };
}

function signatureFor(body: Uint8Array): string {
  return sign("RSA-SHA256", Buffer.from(body), privateKey).toString("base64");
}

function ports(options: {
  body?: Uint8Array;
  signature?: string;
  receipt?: BogReceipt | (() => Promise<BogReceipt>);
  apply?: (input: ApplyBogPaymentReceiptInput) => Promise<unknown>;
  verify?: BogCallbackPorts["verifySignature"];
} = {}): {
  ports: BogCallbackPorts;
  calls: ApplyBogPaymentReceiptInput[];
  receiptIds: string[];
} {
  const calls: ApplyBogPaymentReceiptInput[] = [];
  const receiptIds: string[] = [];

  return {
    calls,
    receiptIds,
    ports: {
      verifySignature:
        options.verify ??
        ((rawBody, signature) => {
          verifyBogCallbackSignature(
            rawBody,
            signature,
            publicKeyPem,
          );
        }),
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
        return applied("applied_paid");
      },
    },
  };
}

async function main(): Promise<void> {
  const body = callbackBody();
  const signature = signatureFor(body);
  const happy = ports();
  const accepted = await processBogPaymentCallback(body, signature, happy.ports);

  assert.deepEqual(accepted, { status: 200, body: { received: true } });
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
  assert.equal(JSON.stringify(accepted).includes(LEAK), false);
  assert.equal(JSON.stringify(accepted).includes("90.00"), false);
  assert.equal(JSON.stringify(accepted).includes(ORDER_ID), false);
  assert.equal(JSON.stringify(accepted).includes("Bearer"), false);

  const tampered = new Uint8Array(body);
  tampered[10] = tampered[10] === 65 ? 66 : 65;
  const badSignature = ports();
  const rejectedSignature = await processBogPaymentCallback(
    tampered,
    signature,
    badSignature.ports,
  );
  assert.deepEqual(rejectedSignature, { status: 400, body: { error: "rejected" } });
  assert.equal(badSignature.receiptIds.length, 0);
  assert.equal(badSignature.calls.length, 0);

  const unsigned = ports({
    verify: () => {
      throw new BogError("malformed", `signature ${LEAK}`);
    },
  });
  const missingSignature = await processBogPaymentCallback(
    body,
    "",
    unsigned.ports,
  );
  assert.equal(missingSignature.status, 400);
  assert.equal(unsigned.receiptIds.length, 0);
  assert.equal(JSON.stringify(missingSignature).includes(LEAK), false);

  const misconfigured = ports({
    verify: () => {
      throw new BogError("configuration", `public key ${LEAK}`);
    },
  });
  assert.deepEqual(
    await processBogPaymentCallback(body, signature, misconfigured.ports),
    { status: 503, body: { error: "unavailable" } },
  );
  assert.equal(misconfigured.receiptIds.length, 0);

  const malformedBodies = [
    new TextEncoder().encode("{"),
    new TextEncoder().encode(JSON.stringify({ event: "refund", body: { order_id: BANK_ID } })),
    new TextEncoder().encode(JSON.stringify({ event: "order_payment", body: {} })),
    new TextEncoder().encode(JSON.stringify({ event: "order_payment", body: { order_id: "  " } })),
  ];

  for (const malformedBody of malformedBodies) {
    const malformed = ports();
    const result = await processBogPaymentCallback(
      malformedBody,
      signatureFor(malformedBody),
      malformed.ports,
    );
    assert.equal(result.status, 400);
    assert.equal(malformed.receiptIds.length, 0);
    assert.equal(malformed.calls.length, 0);
  }

  const receiptDown = ports({
    receipt: async () => {
      throw new BogError("network", `receipt ${LEAK}`, { status: 503 });
    },
  });
  assert.deepEqual(
    await processBogPaymentCallback(body, signature, receiptDown.ports),
    { status: 503, body: { error: "unavailable" } },
  );
  assert.equal(receiptDown.calls.length, 0);

  const receiptAuth = ports({
    receipt: async () => {
      throw new BogError("authentication", `Bearer ${LEAK}`, { status: 401 });
    },
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, receiptAuth.ports)).status,
    503,
  );
  assert.equal(receiptAuth.calls.length, 0);

  const receiptMalformed = ports({
    receipt: async () => {
      throw new BogError("malformed", `receipt ${LEAK}`);
    },
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, receiptMalformed.ports)).status,
    400,
  );
  assert.equal(receiptMalformed.calls.length, 0);

  const differentReceipt = ports({
    receipt: receipt({ orderId: "other-bank-order" }),
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, differentReceipt.ports)).status,
    400,
  );
  assert.equal(differentReceipt.calls.length, 0);

  const notUuid = ports({
    receipt: receipt({ externalOrderId: "store-order-1" }),
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, notUuid.ports)).status,
    400,
  );
  assert.equal(notUuid.calls.length, 0);

  const ignoredCallbackStatus = ports({
    receipt: receipt({
      orderStatusKey: "rejected",
      requestAmount: "90.00",
      transferAmount: "0",
      currencyCode: "GEL",
    }),
    apply: async (input) => {
      ignoredCallbackStatus.calls.push(input);
      return applied("provider_rejected", "pending");
    },
  });
  const rejectedPayment = await processBogPaymentCallback(
    body,
    signature,
    ignoredCallbackStatus.ports,
  );
  assert.equal(rejectedPayment.status, 200);
  assert.equal(ignoredCallbackStatus.calls[0]?.receiptStatus, "rejected");
  assert.equal(ignoredCallbackStatus.calls[0]?.requestAmount, "90.00");
  assert.equal(ignoredCallbackStatus.calls[0]?.currencyCode, "GEL");

  const outcomes = [
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
  ] as const;

  for (const outcome of outcomes) {
    const recorded = ports({
      apply: async (input) => {
        recorded.calls.push(input);
        return applied(outcome, outcome === "already_paid" ? "paid" : "pending");
      },
    });
    const result = await processBogPaymentCallback(body, signature, recorded.ports);
    assert.equal(result.status, 200, outcome);
    assert.deepEqual(result.body, { received: true });
  }

  const delayed = ports({
    receipt: receipt({ orderStatusKey: "processing" }),
    apply: async (input) => {
      delayed.calls.push(input);
      return applied("observed");
    },
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, delayed.ports)).status,
    200,
  );
  assert.equal(delayed.calls[0]?.receiptStatus, "processing");

  const duplicate = ports({
    apply: async () => applied("already_recorded", "paid"),
  });
  const first = await processBogPaymentCallback(body, signature, duplicate.ports);
  const second = await processBogPaymentCallback(body, signature, duplicate.ports);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(duplicate.calls.length, 2);
  assert.equal(duplicate.receiptIds.length, 2);

  const missingOrder = ports({
    apply: async () => {
      throw new Error(`payment:order_not_found ${LEAK}`);
    },
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, missingOrder.ports)).status,
    400,
  );

  const invalidReceipt = ports({
    apply: async () => {
      throw new Error("payment:invalid_receipt");
    },
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, invalidReceipt.ports)).status,
    400,
  );

  const updateConflict = ports({
    apply: async () => {
      throw new Error(`payment:paid_update_conflict ${LEAK}`);
    },
  });
  const conflict = await processBogPaymentCallback(
    body,
    signature,
    updateConflict.ports,
  );
  assert.equal(conflict.status, 503);
  assert.equal(JSON.stringify(conflict).includes(LEAK), false);

  const databaseDown = ports({
    apply: async () => {
      throw new Error(`connection ${LEAK}`);
    },
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, databaseDown.ports)).status,
    503,
  );

  const unpaidConfirmation = ports({
    apply: async () => applied("applied_paid", "pending"),
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, unpaidConfirmation.ports)).status,
    503,
  );

  const wrongOrder = ports({
    apply: async () => ({
      result: "applied_paid",
      order_id: "11111111-1111-4111-8111-111111111111",
      payment_status: "paid",
    }),
  });
  assert.equal(
    (await processBogPaymentCallback(body, signature, wrongOrder.ports)).status,
    503,
  );

  const routeSource = readFileSync(
    new URL("../../../app/api/payments/bog/callback/route.ts", import.meta.url),
    "utf8",
  );
  const processorSource = readFileSync(
    new URL("./process-callback.ts", import.meta.url),
    "utf8",
  );
  assert.equal(APPLY_BOG_PAYMENT_RECEIPT_RPC, "apply_bog_payment_receipt");
  assert.equal(routeSource.includes("processBogPaymentCallback"), true);
  assert.equal(routeSource.includes("callback-signature"), true);
  assert.equal(processorSource.includes("verifyBogCallbackSignature"), true);
  assert.equal(processorSource.includes("getBogReceipt"), true);
  assert.equal(processorSource.includes("apply_bog_payment_receipt"), true);
  assert.equal(processorSource.includes(".update("), false);
  assert.equal(processorSource.includes("payment_status = \"paid\""), false);
  assert.equal(processorSource.includes("p_request_amount: input.requestAmount"), true);
  assert.equal(routeSource.includes("CheckoutPageContent"), false);
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
