import assert from "node:assert/strict";

import {
  quoteCheckout,
  type QuoteCheckoutLineInput,
  type QuoteCheckoutProduct,
} from "./quote-checkout";

function product(
  overrides: Partial<QuoteCheckoutProduct> = {},
): QuoteCheckoutProduct {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Blade",
    price: "40",
    salePrice: null,
    stock: 5,
    ...overrides,
  };
}

const secondId = "22222222-2222-4222-8222-222222222222";

function line(
  quantity: number,
  productId = product().id,
): QuoteCheckoutLineInput {
  return { productId, quantity };
}

const regular = quoteCheckout([product()], [line(2)]);
assert.equal(regular.ok, true);
if (regular.ok) {
  assert.equal(regular.quote.lines[0]?.regularPrice, "40");
  assert.equal(regular.quote.lines[0]?.unitPrice, "40");
  assert.equal(regular.quote.lines[0]?.lineTotal, "80");
  assert.equal(regular.quote.subtotal, "80");
  assert.equal(regular.quote.deliveryAllowed, false);
}

const sale = quoteCheckout(
  [product({ price: "80", salePrice: "50" })],
  [line(3)],
);
assert.equal(sale.ok, true);
if (sale.ok) {
  assert.equal(sale.quote.lines[0]?.regularPrice, "80");
  assert.equal(sale.quote.lines[0]?.unitPrice, "50");
  assert.equal(sale.quote.lines[0]?.lineTotal, "150");
  assert.equal(sale.quote.subtotal, "150");
  assert.equal(sale.quote.deliveryAllowed, true);
}

for (const salePrice of ["0", "0.00", "80", "90", "-5"]) {
  const ignoredSale = quoteCheckout(
    [product({ price: "80", salePrice })],
    [line(1)],
  );
  assert.equal(ignoredSale.ok, true, salePrice);
  if (ignoredSale.ok) {
    assert.equal(ignoredSale.quote.lines[0]?.regularPrice, "80");
    assert.equal(ignoredSale.quote.lines[0]?.unitPrice, "80");
    assert.equal(ignoredSale.quote.lines[0]?.lineTotal, "80");
  }
}

const fractional = quoteCheckout(
  [product({ price: "10.50", salePrice: "10.25" })],
  [line(2)],
);
assert.equal(fractional.ok, true);
if (fractional.ok) {
  assert.equal(fractional.quote.lines[0]?.regularPrice, "10.5");
  assert.equal(fractional.quote.lines[0]?.unitPrice, "10.25");
  assert.equal(fractional.quote.lines[0]?.lineTotal, "20.5");
  assert.equal(fractional.quote.subtotal, "20.5");
}

for (const quantity of [0, -1, 1.5, 2147483648]) {
  const invalid = quoteCheckout([product()], [line(quantity)]);
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.error.code, "invalid_quantity");
  }
}

const duplicates = quoteCheckout(
  [product({ price: "10", stock: 5 })],
  [line(2), line(1)],
);
assert.equal(duplicates.ok, true);
if (duplicates.ok) {
  assert.equal(duplicates.quote.lines.length, 1);
  assert.equal(duplicates.quote.lines[0]?.quantity, 3);
  assert.equal(duplicates.quote.subtotal, "30");
}

const overflow = quoteCheckout(
  [product()],
  [line(2147483647), line(1)],
);
assert.equal(overflow.ok, false);
if (!overflow.ok) {
  assert.equal(overflow.error.code, "invalid_quantity");
}

const missing = quoteCheckout([product()], [line(1, secondId)]);
assert.equal(missing.ok, false);
if (!missing.ok) {
  assert.equal(missing.error.code, "missing_product");
  assert.equal(missing.error.productId, secondId);
}

const nullStock = quoteCheckout(
  [product({ stock: null })],
  [line(1)],
);
assert.equal(nullStock.ok, false);
if (!nullStock.ok) {
  assert.equal(nullStock.error.code, "unavailable_stock");
  assert.equal(nullStock.error.title, "Blade");
}

const insufficient = quoteCheckout(
  [product({ stock: 1 })],
  [line(2)],
);
assert.equal(insufficient.ok, false);
if (!insufficient.ok) {
  assert.equal(insufficient.error.code, "insufficient_stock");
}

const belowDelivery = quoteCheckout(
  [product({ price: "149", stock: 1 })],
  [line(1)],
);
assert.equal(belowDelivery.ok, true);
if (belowDelivery.ok) {
  assert.equal(belowDelivery.quote.subtotal, "149");
  assert.equal(belowDelivery.quote.deliveryAllowed, false);
}

const atDelivery = quoteCheckout(
  [product({ price: "150", stock: 1 })],
  [line(1)],
);
assert.equal(atDelivery.ok, true);
if (atDelivery.ok) {
  assert.equal(atDelivery.quote.subtotal, "150");
  assert.equal(atDelivery.quote.deliveryAllowed, true);
}

const splitDelivery = quoteCheckout(
  [
    product({ id: secondId, price: "50", stock: 1 }),
    product({ price: "100", stock: 1 }),
  ],
  [line(1), line(1, secondId)],
);
assert.equal(splitDelivery.ok, true);
if (splitDelivery.ok) {
  assert.equal(splitDelivery.quote.subtotal, "150");
  assert.equal(splitDelivery.quote.deliveryAllowed, true);
  assert.deepEqual(
    splitDelivery.quote.lines.map((item) => item.productId),
    [product().id, secondId],
  );
}

const clientPriced = quoteCheckout(
  [product({ price: "40" })],
  [{ ...line(1), price: 1 } as QuoteCheckoutLineInput],
);
assert.equal(clientPriced.ok, true);
if (clientPriced.ok) {
  assert.equal(clientPriced.quote.lines[0]?.regularPrice, "40");
  assert.equal(clientPriced.quote.lines[0]?.unitPrice, "40");
  assert.equal(clientPriced.quote.subtotal, "40");
}

const invalidPrice = quoteCheckout(
  [product({ price: "-1" })],
  [line(1)],
);
assert.equal(invalidPrice.ok, false);
if (!invalidPrice.ok) {
  assert.equal(invalidPrice.error.code, "invalid_price");
}

const empty = quoteCheckout([product()], []);
assert.equal(empty.ok, false);
if (!empty.ok) {
  assert.equal(empty.error.code, "empty_cart");
}
