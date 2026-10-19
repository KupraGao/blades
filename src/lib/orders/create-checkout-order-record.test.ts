import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { DELIVERY_MIN_SUBTOTAL_GEL } from "./delivery-rules";
import { assertCheckoutIdempotencyKey } from "./checkout-idempotency-key";
import {
  CREATE_CHECKOUT_ORDER_RPC,
  buildCreateCheckoutOrderArgs,
  mapCreateCheckoutOrderRpcError,
} from "./create-checkout-order-record";

const CHECKOUT_KEY = "550e8400-e29b-41d4-a716-446655440000";

assert.equal(DELIVERY_MIN_SUBTOTAL_GEL, 150);
assert.equal(CREATE_CHECKOUT_ORDER_RPC, "create_checkout_order");

const args = buildCreateCheckoutOrderArgs({
  customerName: " ანა ",
  customerPhone: "599123456",
  customerEmail: "",
  customerAddress: "თბილისი",
  customerNote: "",
  fulfillmentMethod: "delivery",
  paymentMethod: "online",
  userId: null,
  idempotencyKey: CHECKOUT_KEY,
  items: [
    { productId: "product-1", quantity: 1 },
    { productId: "product-2", quantity: 2 },
  ],
});

assert.deepEqual(Object.keys(args).sort(), [
  "p_customer_address",
  "p_customer_email",
  "p_customer_name",
  "p_customer_note",
  "p_customer_phone",
  "p_fulfillment_method",
  "p_idempotency_key",
  "p_items",
  "p_payment_method",
  "p_user_id",
].sort());
assert.equal(args.p_idempotency_key, CHECKOUT_KEY);
assert.equal(args.p_user_id, null);
assert.equal(args.p_fulfillment_method, "delivery");
assert.equal(args.p_payment_method, "online");
assert.deepEqual(args.p_items, [
  { product_id: "product-1", quantity: 1 },
  { product_id: "product-2", quantity: 2 },
]);
assert.equal("p_total_price" in args, false);
assert.equal("p_idempotency_fingerprint" in args, false);
assert.equal("price" in args.p_items[0], false);
assert.equal("stock" in args.p_items[0], false);
assert.equal(
  buildCreateCheckoutOrderArgs({
    customerName: "ანა",
    customerPhone: "599123456",
    fulfillmentMethod: "pickup",
    paymentMethod: "pay_at_pickup",
    userId: null,
    idempotencyKey: CHECKOUT_KEY,
    items: [{ productId: "product-1", quantity: 1 }],
  }).p_idempotency_key,
  buildCreateCheckoutOrderArgs({
    customerName: "ანა",
    customerPhone: "599123456",
    fulfillmentMethod: "pickup",
    paymentMethod: "pay_at_pickup",
    userId: null,
    idempotencyKey: CHECKOUT_KEY.toUpperCase(),
    items: [{ productId: "product-1", quantity: 1 }],
  }).p_idempotency_key,
);

assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:delivery_minimum").message,
  "orderErrorDeliveryMinimum",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:invalid_payment_combination").message,
  "orderErrorPaymentCombinationInvalid",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:null_stock|Blade").message,
  "orderErrorInsufficientStock|Blade",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:insufficient_stock|Blade").message,
  "orderErrorInsufficientStock|Blade",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:products_not_found").message,
  "orderErrorProductsNotFound",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("permission denied").message,
  "orderErrorSaveOrder",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:idempotency_conflict").message,
  "orderErrorIdempotencyConflict",
);
assert.equal(
  mapCreateCheckoutOrderRpcError("checkout:invalid_idempotency_key").message,
  "orderErrorInvalidIdempotencyKey",
);
assert.throws(
  () => assertCheckoutIdempotencyKey("550e8400-e29b-11d4-a716-446655440000"),
  { message: "orderErrorInvalidIdempotencyKey" },
);

const actionSource = readFileSync(
  new URL("../../actions/orders/create-order.ts", import.meta.url),
  "utf8",
);
const helperSource = readFileSync(
  new URL("./create-checkout-order-record.ts", import.meta.url),
  "utf8",
);

assert.equal(actionSource.includes("decrementOrderStock"), false);
assert.equal(actionSource.includes("decrementProductStock"), false);
assert.equal(actionSource.includes("insertOrder("), false);
assert.equal(actionSource.includes("insertOrderItems"), false);
assert.equal(actionSource.includes("deleteOrder"), false);
assert.equal(actionSource.includes(".from("), false);
assert.equal(actionSource.includes("createCheckoutOrderRecord"), true);
assert.equal(actionSource.includes("getAuthUser"), true);
assert.equal(actionSource.includes("isCheckoutIdempotencySchemaEnabled"), false);
assert.equal(helperSource.includes("isCheckoutIdempotencySchemaEnabled"), false);
assert.equal(actionSource.includes("p_idempotency_fingerprint"), false);
assert.equal(helperSource.includes("p_idempotency_key"), true);
assert.equal(helperSource.includes("Idempotency-Key"), false);
assert.equal(helperSource.includes(".from("), false);
assert.equal(helperSource.includes("create_checkout_order"), true);
