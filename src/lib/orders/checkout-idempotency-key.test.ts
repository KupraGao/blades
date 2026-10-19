import assert from "node:assert/strict";

import {
  assertCheckoutIdempotencyKey,
  canonicalCheckoutIdempotencyIdentity,
  clearCheckoutIdempotencyAttempt,
  createCheckoutIdempotencyKey,
  resolveCheckoutIdempotencyKey,
  type CheckoutIdempotencyIdentity,
  type CheckoutIdempotencyStorage,
} from "./checkout-idempotency-key";
import { buildCreateCheckoutOrderArgs } from "./create-checkout-order-record";
import { localizeStorefrontMessage } from "../i18n/localize-storefront-message";
import { en } from "../../dictionaries/en";
import { ka } from "../../dictionaries/ka";

const KEY_A = "550e8400-e29b-41d4-a716-446655440000";
const KEY_B = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const KEY_C = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

function memoryStorage(): CheckoutIdempotencyStorage & { snapshot: Map<string, string> } {
  const snapshot = new Map<string, string>();
  return {
    snapshot,
    getItem: (key) => snapshot.get(key) ?? null,
    setItem: (key, value) => {
      snapshot.set(key, value);
    },
    removeItem: (key) => {
      snapshot.delete(key);
    },
  };
}

function identity(
  overrides: Partial<CheckoutIdempotencyIdentity> = {},
): CheckoutIdempotencyIdentity {
  return {
    customerName: " ანა ",
    customerPhone: "599123456",
    customerEmail: " ana@example.com ",
    customerAddress: "თბილისი",
    fulfillmentMethod: "delivery",
    paymentMethod: "online",
    items: [
      { productId: "product-2", quantity: 1 },
      { productId: "product-1", quantity: 2 },
    ],
    ...overrides,
  };
}

function keysFrom(createKey: () => string) {
  const issued: string[] = [];
  return {
    issued,
    createKey: () => {
      const key = createKey();
      issued.push(key);
      return key;
    },
  };
}

const storage = memoryStorage();
const firstFactory = keysFrom(() => KEY_A);
const firstKey = resolveCheckoutIdempotencyKey(
  storage,
  identity(),
  firstFactory.createKey,
);
assert.equal(firstKey, KEY_A);
assert.equal(firstFactory.issued.length, 1);

const secondFactory = keysFrom(() => KEY_B);
const secondKey = resolveCheckoutIdempotencyKey(
  storage,
  identity(),
  secondFactory.createKey,
);
assert.equal(secondKey, KEY_A);
assert.equal(secondFactory.issued.length, 0);

const refreshedStorage = storage;
const refreshedKey = resolveCheckoutIdempotencyKey(
  refreshedStorage,
  identity({
    customerName: "ანა",
    customerEmail: "ana@example.com",
    items: [
      { productId: "product-1", quantity: 2 },
      { productId: "product-2", quantity: 1 },
    ],
  }),
  () => KEY_C,
);
assert.equal(refreshedKey, KEY_A);

const changedKey = resolveCheckoutIdempotencyKey(
  storage,
  identity({ customerPhone: "599000111" }),
  () => KEY_B,
);
assert.equal(changedKey, KEY_B);
assert.notEqual(changedKey, KEY_A);

const cartChangedKey = resolveCheckoutIdempotencyKey(
  storage,
  identity({
    customerPhone: "599000111",
    items: [{ productId: "product-1", quantity: 3 }],
  }),
  () => KEY_C,
);
assert.equal(cartChangedKey, KEY_C);

resolveCheckoutIdempotencyKey(storage, identity(), () => KEY_A);
const lostResponseKey = resolveCheckoutIdempotencyKey(
  storage,
  identity(),
  () => KEY_B,
);
assert.equal(lostResponseKey, KEY_A);

const repeatedArgs = [0, 1].map(() =>
  buildCreateCheckoutOrderArgs({
    customerName: "ანა",
    customerPhone: "599123456",
    fulfillmentMethod: "delivery",
    paymentMethod: "online",
    userId: null,
    idempotencyKey: lostResponseKey,
    items: [{ productId: "product-1", quantity: 2 }],
  }),
);
assert.equal(repeatedArgs[0].p_idempotency_key, repeatedArgs[1].p_idempotency_key);
assert.equal(repeatedArgs[0].p_user_id, null);
assert.equal("p_idempotency_fingerprint" in repeatedArgs[0], false);

clearCheckoutIdempotencyAttempt(storage);
const afterSuccess = resolveCheckoutIdempotencyKey(
  storage,
  identity(),
  () => KEY_C,
);
assert.equal(afterSuccess, KEY_C);

assert.equal(assertCheckoutIdempotencyKey(KEY_A.toUpperCase()), KEY_A);
assert.throws(
  () => assertCheckoutIdempotencyKey("00000000-0000-0000-0000-000000000000"),
  { message: "orderErrorInvalidIdempotencyKey" },
);
assert.throws(
  () => assertCheckoutIdempotencyKey("550e8400-e29b-11d4-a716-446655440000"),
  { message: "orderErrorInvalidIdempotencyKey" },
);

const generated = createCheckoutIdempotencyKey();
assert.equal(assertCheckoutIdempotencyKey(generated), generated);

assert.equal(
  canonicalCheckoutIdempotencyIdentity(identity()),
  canonicalCheckoutIdempotencyIdentity(
    identity({
      items: [
        { productId: "product-1", quantity: 1 },
        { productId: "product-1", quantity: 1 },
        { productId: "product-2", quantity: 1 },
      ],
    }),
  ),
);

assert.equal(
  localizeStorefrontMessage("orderErrorIdempotencyConflict", ka).includes("განაახლეთ"),
  true,
);
assert.equal(
  localizeStorefrontMessage("orderErrorInvalidIdempotencyKey", en).includes("invalid"),
  true,
);
assert.equal(
  localizeStorefrontMessage("orderErrorIdempotencyUnavailable", ka).length > 0,
  true,
);
