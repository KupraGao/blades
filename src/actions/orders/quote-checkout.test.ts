import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { quoteCheckoutOrder } from "./quote-checkout";

const source = readFileSync(
  join(process.cwd(), "src/actions/orders/quote-checkout.ts"),
  "utf8",
);

assert.match(source, /createClient/);
assert.doesNotMatch(source, /createAdminClient/);
assert.match(source, /select\("id, title, price, sale_price, stock"\)/);
assert.doesNotMatch(source, /\.insert\(|\.update\(|\.delete\(|\.rpc\(/);

async function main(): Promise<void> {
const empty = await quoteCheckoutOrder([]);
assert.equal(empty.ok, false);
if (!empty.ok) {
  assert.equal(empty.error.code, "empty_cart");
}

const blankId = await quoteCheckoutOrder([
  { productId: "  ", quantity: 1 },
]);
assert.equal(blankId.ok, false);
if (!blankId.ok) {
  assert.equal(blankId.error.code, "invalid_product_id");
}

const badId = await quoteCheckoutOrder([
  { productId: "not-a-uuid", quantity: 1 },
]);
assert.equal(badId.ok, false);
if (!badId.ok) {
  assert.equal(badId.error.code, "invalid_product_id");
}

for (const quantity of [0, -1, 1.5, 2147483648]) {
  const invalid = await quoteCheckoutOrder([
    {
      productId: "11111111-1111-4111-8111-111111111111",
      quantity,
    },
  ]);
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.error.code, "invalid_quantity");
  }
}

const overflow = await quoteCheckoutOrder([
  {
    productId: "11111111-1111-4111-8111-111111111111",
    quantity: 2147483647,
  },
  {
    productId: "11111111-1111-4111-8111-111111111111",
    quantity: 1,
  },
]);
assert.equal(overflow.ok, false);
if (!overflow.ok) {
  assert.equal(overflow.error.code, "invalid_quantity");
}

const priced = await quoteCheckoutOrder([
  {
    productId: "not-a-uuid",
    quantity: 1,
    price: 1,
  } as { productId: string; quantity: number },
]);
assert.equal(priced.ok, false);
if (!priced.ok) {
  assert.equal(priced.error.code, "invalid_product_id");
  assert.equal("price" in priced.error, false);
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
