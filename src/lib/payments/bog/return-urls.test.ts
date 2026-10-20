import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildCreateOrderBody } from "./create-order";
import { BogError } from "./errors";
import { buildBogCheckoutReturnUrls } from "./return-urls";
import { mapStoredPaymentStatus } from "../../orders/read-checkout-payment-status";

const ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
const CALLBACK = "https://shop.example/api/payments/bog/callback";

function main(): void {
  const urls = buildBogCheckoutReturnUrls(CALLBACK, ORDER_ID);
  const expected = `https://shop.example/checkout/payment/${ORDER_ID}`;
  assert.deepEqual(urls, { success: expected, fail: expected });
  assert.equal(new URL(urls.success).search, "");

  const body = buildCreateOrderBody({
    callback_url: CALLBACK,
    external_order_id: ORDER_ID,
    idempotencyKey: ORDER_ID,
    redirect_urls: urls,
    purchase_units: {
      currency: "GEL",
      total_amount: 10,
      basket: [{ product_id: "sku-1", quantity: 2, unit_price: 5 }],
    },
  });
  assert.deepEqual(body.redirect_urls, urls);
  assert.equal(JSON.stringify(body).includes("payment_status"), false);

  assert.throws(
    () => buildBogCheckoutReturnUrls("http://shop.example/callback", ORDER_ID),
    (error: unknown) => error instanceof BogError && error.kind === "malformed",
  );
  assert.throws(
    () =>
      buildBogCheckoutReturnUrls(
        "https://user:secret@shop.example/callback",
        ORDER_ID,
      ),
    (error: unknown) => error instanceof BogError && error.kind === "malformed",
  );
  assert.throws(
    () => buildBogCheckoutReturnUrls(CALLBACK, "not-an-order"),
    (error: unknown) => error instanceof BogError && error.kind === "malformed",
  );

  assert.equal(mapStoredPaymentStatus("paid"), "paid");
  assert.equal(mapStoredPaymentStatus("pending"), "pending");
  assert.equal(mapStoredPaymentStatus("unpaid"), "pending");
  assert.equal(mapStoredPaymentStatus("failed"), "failed");
  assert.equal(mapStoredPaymentStatus("refund_pending"), "refund_pending");
  assert.equal(mapStoredPaymentStatus("refunded"), "refunded");
  assert.equal(mapStoredPaymentStatus("completed"), "pending");
  assert.equal(mapStoredPaymentStatus(null), "pending");

  const prepare = readFileSync(
    new URL("../../orders/prepare-bog-create-order.ts", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL(
      "../../../app/(shop)/checkout/payment/[orderId]/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const reader = readFileSync(
    new URL("../../orders/read-checkout-payment-status.ts", import.meta.url),
    "utf8",
  );
  const content = readFileSync(
    new URL(
      "../../../components/checkout/CheckoutPaymentStatusContent.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(prepare, /redirect_urls: buildBogCheckoutReturnUrls/);
  assert.equal(prepare.includes("payment_method !== \"online\""), true);
  assert.doesNotMatch(page, /searchParams/);
  assert.doesNotMatch(page, /getBogReceipt/);
  assert.doesNotMatch(page, /payment_status/);
  assert.match(reader, /verifyOrderAccessProof/);
  assert.match(
    reader,
    /select\("id, order_number, payment_status, payment_method"\)/,
  );
  assert.doesNotMatch(reader, /customer_name|customer_phone|customer_email|customer_address/);
  assert.doesNotMatch(reader, /getBogReceipt/);
  assert.doesNotMatch(content, /searchParams|payment_status|customer_name/);
}

main();
