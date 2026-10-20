import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ka } from "../../dictionaries/ka";
import { en } from "../../dictionaries/en";
import { localizeStorefrontMessage } from "../i18n/localize-storefront-message";
import { BogError } from "../payments/bog/errors";
import { readBankPaymentRedirectUrl } from "../payments/bog/payment-redirect";
import { resolveCheckoutPaymentNavigation } from "./checkout-payment-navigation";
import {
  ATTACH_BOG_PROVIDER_ORDER_RPC,
  initiateOnlineBogPayment,
  type OnlineBogPaymentPorts,
  type StoredOrderPaymentRow,
} from "./initiate-online-bog-payment";

const ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
const BANK_ID = "bogOrder1";
const OTHER_BANK_ID = "bogOrder2";
const REDIRECT_URL = "https://payment-sandbox.bog.ge/?order_id=bogOrder1";
const LEAK = "LEAKED_BANK_SECRET";

const originalConsoleError = console.error;
console.error = () => {};

async function main(): Promise<void> {

function order(
  overrides: Partial<StoredOrderPaymentRow> = {},
): StoredOrderPaymentRow {
  return {
    id: ORDER_ID,
    paymentMethod: "online",
    paymentStatus: "unpaid",
    paymentProvider: null,
    providerOrderId: null,
    orderStatus: "pending",
    ...overrides,
  };
}

function attachedPayload(
  result: "attached" | "already_attached" = "attached",
  paymentStatus = "pending",
) {
  return {
    result,
    order_id: ORDER_ID,
    payment_status: paymentStatus,
  };
}

type Script = {
  read?: OnlineBogPaymentPorts["readOrderPayment"];
  create?: OnlineBogPaymentPorts["createBankOrder"];
  attach?: OnlineBogPaymentPorts["attachProviderOrder"];
  allow?: OnlineBogPaymentPorts["isRedirectAllowed"];
};

function scripted(options: Script = {}): {
  ports: OnlineBogPaymentPorts;
  createArgs: unknown[][];
  attachArgs: Array<[string, string]>;
} {
  const createArgs: unknown[][] = [];
  const attachArgs: Array<[string, string]> = [];

  return {
    createArgs,
    attachArgs,
    ports: {
      readOrderPayment:
        options.read ??
        (async () => order()),
      createBankOrder:
        options.create ??
        (async (...args: unknown[]) => {
          createArgs.push(args);
          return { orderId: BANK_ID, redirectUrl: REDIRECT_URL };
        }),
      attachProviderOrder:
        options.attach ??
        (async (...args: [string, string]) => {
          attachArgs.push(args);
          return attachedPayload();
        }),
      isRedirectAllowed: options.allow ?? (() => true),
    },
  };
}

async function expectCode(
  run: () => Promise<unknown>,
  code: string,
): Promise<void> {
  await assert.rejects(run, (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.message, code);
    assert.equal(error.message.includes(LEAK), false);
    assert.equal(error.message.includes("Bearer"), false);
    assert.equal(error.message.toLowerCase().includes("service_role"), false);
    return true;
  });
}

const happy = scripted();
const happyResult = await initiateOnlineBogPayment(ORDER_ID, happy.ports);
assert.deepEqual(happyResult, {
  orderId: ORDER_ID,
  redirectUrl: REDIRECT_URL,
});
assert.deepEqual(happy.createArgs, [[ORDER_ID]]);
assert.deepEqual(happy.attachArgs, [[ORDER_ID, BANK_ID]]);
assert.equal("paymentStatus" in happyResult, false);

const bogDown = scripted({
  create: async () => {
    throw new BogError(
      "network",
      `BOG create-order request failed. Bearer ${LEAK}`,
      { status: 500 },
    );
  },
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, bogDown.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(bogDown.attachArgs.length, 0);

const malformed = scripted({
  create: async () => {
    throw new BogError("malformed", `unexpected ${LEAK}`);
  },
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, malformed.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(malformed.attachArgs.length, 0);

for (const bankOrder of [
  { orderId: "", redirectUrl: REDIRECT_URL },
  { orderId: "bad id", redirectUrl: REDIRECT_URL },
  { orderId: "a".repeat(129), redirectUrl: REDIRECT_URL },
  { orderId: BANK_ID, redirectUrl: "" },
  { orderId: BANK_ID, redirectUrl: "https://evil.example/pay" },
  { orderId: BANK_ID, redirectUrl: "http://payment.bog.ge/pay" },
  { orderId: BANK_ID, redirectUrl: "https://user:pass@payment.bog.ge/pay" },
  { orderId: BANK_ID, redirectUrl: "https://payment.bog.ge:444/pay" },
  { orderId: BANK_ID, redirectUrl: "javascript:alert(1)" },
  { orderId: BANK_ID, redirectUrl: "https://payment.bog.ge.evil.com/pay" },
]) {
  const unsafe = scripted({
    create: async () => bankOrder,
  });
  await expectCode(
    () => initiateOnlineBogPayment(ORDER_ID, unsafe.ports),
    "orderErrorPaymentStartFailed",
  );
  assert.equal(unsafe.attachArgs.length, 0);
}

const wrongHost = scripted({
  allow: (url) => new URL(url).hostname === "payment.bog.ge",
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, wrongHost.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(wrongHost.createArgs.length, 1);
assert.equal(wrongHost.attachArgs.length, 0);

const hostThrew = scripted({
  allow: () => {
    throw new BogError("configuration", `BOG_CLIENT_SECRET ${LEAK}`);
  },
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, hostThrew.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(hostThrew.attachArgs.length, 0);

const attachCodes = [
  ["payment:invalid_provider_order_id", "orderErrorPaymentStartFailed"],
  ["payment:order_not_found", "orderErrorPaymentAttachFailed"],
  ["payment:not_online", "orderErrorPaymentUnavailable"],
  ["payment:order_closed", "orderErrorPaymentUnavailable"],
  ["payment:provider_order_conflict", "orderErrorPaymentConflict"],
  ["payment:not_unpaid", "orderErrorPaymentAlreadyStarted"],
  ["payment:attach_conflict", "orderErrorPaymentAttachFailed"],
  [`database down ${LEAK}`, "orderErrorPaymentAttachFailed"],
] as const;

for (const [failure, code] of attachCodes) {
  const failedAttach = scripted({
    attach: async () => {
      throw new Error(`ERROR: ${failure}`);
    },
  });
  await expectCode(
    () => initiateOnlineBogPayment(ORDER_ID, failedAttach.ports),
    code,
  );
}

const badAttachPayload = scripted({
  attach: async () => ({ result: "attached", order_id: ORDER_ID }),
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, badAttachPayload.ports),
  "orderErrorPaymentAttachFailed",
);

const paidAttach = scripted({
  attach: async () => attachedPayload("attached", "paid"),
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, paidAttach.ports),
  "orderErrorPaymentAlreadyStarted",
);

const wrongOrderAttach = scripted({
  attach: async () => ({
    result: "attached",
    order_id: "11111111-1111-4111-8111-111111111111",
    payment_status: "pending",
  }),
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, wrongOrderAttach.ports),
  "orderErrorPaymentAttachFailed",
);

const replay = scripted({
  read: async () =>
    order({
      paymentStatus: "pending",
      paymentProvider: "bog",
      providerOrderId: BANK_ID,
    }),
  attach: async (...args: [string, string]) => {
    replay.attachArgs.push(args);
    return attachedPayload("already_attached");
  },
});
const replayed = await initiateOnlineBogPayment(ORDER_ID, replay.ports);
assert.deepEqual(replayed, {
  orderId: ORDER_ID,
  redirectUrl: REDIRECT_URL,
});
assert.deepEqual(replay.createArgs, [[ORDER_ID]]);
assert.deepEqual(replay.attachArgs, [[ORDER_ID, BANK_ID]]);

const conflictingReplay = scripted({
  read: async () =>
    order({
      paymentStatus: "pending",
      paymentProvider: "bog",
      providerOrderId: BANK_ID,
    }),
  create: async (...args: unknown[]) => {
    conflictingReplay.createArgs.push(args);
    return { orderId: OTHER_BANK_ID, redirectUrl: REDIRECT_URL };
  },
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, conflictingReplay.ports),
  "orderErrorPaymentConflict",
);
assert.equal(conflictingReplay.attachArgs.length, 0);

const invalidStoredId = scripted({
  read: async () =>
    order({
      paymentStatus: "pending",
      paymentProvider: "bog",
      providerOrderId: "not a bank id",
    }),
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, invalidStoredId.ports),
  "orderErrorPaymentConflict",
);
assert.equal(invalidStoredId.createArgs.length, 0);
assert.equal(invalidStoredId.attachArgs.length, 0);

const blocked = [
  [order({ paymentStatus: "paid", paymentProvider: "bog", providerOrderId: BANK_ID }), "orderErrorPaymentAlreadyStarted"],
  [order({ paymentStatus: "refunded", paymentProvider: "bog", providerOrderId: BANK_ID }), "orderErrorPaymentAlreadyStarted"],
  [order({ paymentStatus: "refund_pending", paymentProvider: "bog", providerOrderId: BANK_ID }), "orderErrorPaymentAlreadyStarted"],
  [order({ paymentStatus: "pending" }), "orderErrorPaymentAlreadyStarted"],
  [order({ paymentStatus: "failed" }), "orderErrorPaymentUnavailable"],
  [order({ paymentMethod: "pay_at_pickup" }), "orderErrorPaymentUnavailable"],
  [order({ orderStatus: "cancelled" }), "orderErrorPaymentUnavailable"],
  [order({ orderStatus: "returned_to_store" }), "orderErrorPaymentUnavailable"],
  [order({ paymentProvider: "other" }), "orderErrorPaymentUnavailable"],
] as const;

for (const [stored, code] of blocked) {
  const stopped = scripted({
    read: async () => stored,
  });
  await expectCode(
    () => initiateOnlineBogPayment(ORDER_ID, stopped.ports),
    code,
  );
  assert.equal(stopped.createArgs.length, 0);
  assert.equal(stopped.attachArgs.length, 0);
}

const missingOrder = scripted({
  read: async () => null,
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, missingOrder.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(missingOrder.createArgs.length, 0);

const readFailed = scripted({
  read: async () => {
    throw new Error(`supabase ${LEAK}`);
  },
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, readFailed.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(readFailed.createArgs.length, 0);

const mismatchedRow = scripted({
  read: async () =>
    order({ id: "11111111-1111-4111-8111-111111111111" }),
});
await expectCode(
  () => initiateOnlineBogPayment(ORDER_ID, mismatchedRow.ports),
  "orderErrorPaymentStartFailed",
);
assert.equal(mismatchedRow.createArgs.length, 0);

await expectCode(
  () => initiateOnlineBogPayment("  ", scripted().ports),
  "orderErrorPaymentStartFailed",
);

let storedProviderId: string | null = null;
let bankCalls = 0;
const sharedPorts: OnlineBogPaymentPorts = {
  readOrderPayment: async () =>
    order({
      paymentStatus: storedProviderId ? "pending" : "unpaid",
      paymentProvider: storedProviderId ? "bog" : null,
      providerOrderId: storedProviderId,
    }),
  createBankOrder: async (...args: unknown[]) => {
    assert.deepEqual(args, [ORDER_ID]);
    bankCalls += 1;
    return { orderId: BANK_ID, redirectUrl: REDIRECT_URL };
  },
  attachProviderOrder: async (orderId, providerOrderId) => {
    assert.equal(orderId, ORDER_ID);
    assert.equal(providerOrderId, BANK_ID);
    const result = storedProviderId === providerOrderId
      ? "already_attached"
      : "attached";
    storedProviderId = providerOrderId;
    return attachedPayload(result);
  },
  isRedirectAllowed: () => true,
};

const [firstPayment, secondPayment] = await Promise.all([
  initiateOnlineBogPayment(ORDER_ID, sharedPorts),
  initiateOnlineBogPayment(ORDER_ID, sharedPorts),
]);
assert.equal(firstPayment.redirectUrl, REDIRECT_URL);
assert.equal(secondPayment.redirectUrl, REDIRECT_URL);
assert.equal(storedProviderId, BANK_ID);

const thirdPayment = await initiateOnlineBogPayment(ORDER_ID, sharedPorts);
assert.equal(thirdPayment.redirectUrl, REDIRECT_URL);
assert.equal(bankCalls, 3);
assert.equal(storedProviderId, BANK_ID);

let racedProviderId: string | null = null;
const raced = scripted({
  read: async () =>
    order({
      paymentStatus: racedProviderId ? "pending" : "unpaid",
      paymentProvider: racedProviderId ? "bog" : null,
      providerOrderId: racedProviderId,
    }),
  create: async () => {
    const nextId = raced.createArgs.length === 0 ? BANK_ID : OTHER_BANK_ID;
    raced.createArgs.push([ORDER_ID]);
    return {
      orderId: nextId,
      redirectUrl: REDIRECT_URL,
    };
  },
  attach: async (orderId, providerOrderId) => {
    raced.attachArgs.push([orderId, providerOrderId]);
    if (racedProviderId && racedProviderId !== providerOrderId) {
      throw new Error(`payment:provider_order_conflict ${LEAK}`);
    }
    racedProviderId = providerOrderId;
    return attachedPayload();
  },
});
const racedResults = await Promise.allSettled([
  initiateOnlineBogPayment(ORDER_ID, raced.ports),
  initiateOnlineBogPayment(ORDER_ID, raced.ports),
]);
const fulfilled = racedResults.filter((result) => result.status === "fulfilled");
const rejected = racedResults.filter((result) => result.status === "rejected");
assert.equal(fulfilled.length, 1);
assert.equal(rejected.length, 1);
assert.equal(racedProviderId, BANK_ID);
if (fulfilled[0]?.status === "fulfilled") {
  assert.equal(fulfilled[0].value.redirectUrl, REDIRECT_URL);
}
if (rejected[0]?.status === "rejected") {
  assert.ok(rejected[0].reason instanceof Error);
  assert.equal(rejected[0].reason.message, "orderErrorPaymentConflict");
  assert.equal(rejected[0].reason.message.includes(LEAK), false);
}

assert.equal(readBankPaymentRedirectUrl(REDIRECT_URL), REDIRECT_URL);
assert.equal(
  readBankPaymentRedirectUrl("https://payment.bog.ge/pay"),
  "https://payment.bog.ge/pay",
);
assert.equal(readBankPaymentRedirectUrl(" https://payment.bog.ge/pay "), "https://payment.bog.ge/pay");
assert.equal(readBankPaymentRedirectUrl("https://evil.example/pay"), null);
assert.equal(readBankPaymentRedirectUrl("http://payment.bog.ge/pay"), null);
assert.equal(readBankPaymentRedirectUrl(null), null);

assert.deepEqual(
  resolveCheckoutPaymentNavigation({
    paymentMethod: "online",
    paymentRedirectUrl: REDIRECT_URL,
  }),
  { type: "bank", redirectUrl: REDIRECT_URL },
);
assert.deepEqual(
  resolveCheckoutPaymentNavigation({
    paymentMethod: "pay_at_pickup",
    paymentRedirectUrl: REDIRECT_URL,
  }),
  { type: "success" },
);
assert.deepEqual(
  resolveCheckoutPaymentNavigation({
    paymentMethod: "online",
    paymentRedirectUrl: "https://evil.example/pay",
  }),
  { type: "error", messageCode: "orderErrorPaymentStartFailed" },
);
assert.deepEqual(
  resolveCheckoutPaymentNavigation({
    paymentMethod: "online",
  }),
  { type: "error", messageCode: "orderErrorPaymentStartFailed" },
);

for (const code of [
  "orderErrorPaymentStartFailed",
  "orderErrorPaymentStartReleased",
  "orderErrorPaymentAttachFailed",
  "orderErrorPaymentAlreadyStarted",
  "orderErrorPaymentConflict",
  "orderErrorPaymentUnavailable",
] as const) {
  assert.equal(localizeStorefrontMessage(code, ka).length > 0, true);
  assert.equal(localizeStorefrontMessage(code, en).length > 0, true);
  assert.notEqual(ka[code], en[code]);
  assert.equal(localizeStorefrontMessage(`${code}|${LEAK}`, ka).includes(LEAK), false);
}

const initiationSource = readFileSync(
  new URL("./initiate-online-bog-payment.ts", import.meta.url),
  "utf8",
);
const actionSource = readFileSync(
  new URL("../../actions/orders/create-order.ts", import.meta.url),
  "utf8",
);
const prepareSource = readFileSync(
  new URL("./prepare-bog-create-order.ts", import.meta.url),
  "utf8",
);
const checkoutSource = readFileSync(
  new URL("../../components/checkout/CheckoutPageContent.tsx", import.meta.url),
  "utf8",
);

assert.equal(ATTACH_BOG_PROVIDER_ORDER_RPC, "attach_bog_provider_order");
assert.equal(initiationSource.includes("createOnlineBogOrder"), true);
assert.equal(initiationSource.includes("attach_bog_provider_order"), true);
assert.equal(initiationSource.includes(".update("), false);
assert.equal(initiationSource.includes("cancel_order"), false);
assert.equal(initiationSource.includes("payment_status: \"paid\""), false);
assert.equal(prepareSource.includes("idempotencyKey: databaseOrderId"), true);
assert.equal(prepareSource.includes("external_order_id: databaseOrderId"), true);
assert.equal(prepareSource.includes("currency: \"GEL\""), true);
assert.equal(prepareSource.includes("redirect_urls: buildBogCheckoutReturnUrls"), true);
assert.equal(actionSource.includes("initiateOnlineBogPayment(orderId)"), true);
assert.equal(actionSource.includes("order.paymentMethod === \"online\""), true);
assert.equal(actionSource.includes("createCheckoutOrderRecord"), true);
assert.equal(actionSource.includes("reason: \"payment_not_started\""), true);
assert.equal(actionSource.includes("readBankOrderDispatch(error) === \"unsent\""), true);
assert.equal(actionSource.includes("releaseUnsentOnlineOrder"), true);
assert.equal(actionSource.includes("cancel_order"), false);
assert.equal(
  actionSource.includes("throw orderError(\"orderErrorPaymentStartFailed\")"),
  false,
);
assert.equal(actionSource.includes(".from("), false);
assert.equal(checkoutSource.includes("resolveCheckoutPaymentNavigation"), true);
assert.equal(checkoutSource.includes("if (!created.success)"), true);
assert.equal(checkoutSource.includes("window.location.assign(navigation.redirectUrl)"), true);
assert.equal(checkoutSource.includes("location.search"), false);
assert.equal(checkoutSource.includes("payment_status"), false);

const createdAt = checkoutSource.indexOf("const created = await createOrder");
const paymentNotStartedAt = checkoutSource.indexOf("if (!created.success)", createdAt);
const rejectedAt = checkoutSource.indexOf("navigation.type === \"error\"");
const failureBlock = checkoutSource.slice(paymentNotStartedAt, rejectedAt);
const clearedAt = checkoutSource.indexOf("clearCheckoutIdempotencyAttempt", rejectedAt);
const removedAt = checkoutSource.indexOf("removeItemsByIds", createdAt);
assert.ok(createdAt >= 0 && paymentNotStartedAt > createdAt);
assert.ok(rejectedAt > paymentNotStartedAt);
assert.equal(failureBlock.includes("created.stockReleased"), true);
assert.equal(failureBlock.includes("clearCheckoutIdempotencyAttempt"), true);
assert.equal(failureBlock.includes("removeItemsByIds"), false);
assert.ok(clearedAt > rejectedAt && removedAt > rejectedAt);

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
