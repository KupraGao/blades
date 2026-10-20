import assert from "node:assert/strict";

import {
  isCurrentQuoteResponse,
  quotePricesMatch,
  quoteSelectionKey,
  type QuotePriceSnapshot,
} from "./quote-checkout-display";

const blade = "11111111-1111-4111-8111-111111111111";
const guard = "22222222-2222-4222-8222-222222222222";

const selection = quoteSelectionKey([
  { productId: ` ${guard.toUpperCase()} `, quantity: 1 },
  { productId: blade, quantity: 2 },
]);

assert.equal(
  selection,
  quoteSelectionKey([
    { productId: blade, quantity: 2 },
    { productId: guard, quantity: 1 },
  ]),
);

assert.equal(
  quoteSelectionKey([
    { productId: blade, quantity: 2 },
    { productId: blade, quantity: 1 },
  ]),
  quoteSelectionKey([{ productId: blade, quantity: 3 }]),
);

assert.notEqual(
  quoteSelectionKey([{ productId: blade, quantity: 2 }]),
  quoteSelectionKey([{ productId: blade, quantity: 3 }]),
);

assert.equal(
  quoteSelectionKey([
    { productId: blade, quantity: 0.2 },
    { productId: blade, quantity: 0.1 },
  ]),
  quoteSelectionKey([
    { productId: blade, quantity: 0.1 },
    { productId: blade, quantity: 0.2 },
  ]),
);
assert.notEqual(
  quoteSelectionKey([
    { productId: blade, quantity: 0.1 },
    { productId: blade, quantity: 0.2 },
  ]),
  quoteSelectionKey([{ productId: blade, quantity: 0.3 }]),
);

assert.notEqual(
  quoteSelectionKey([{ productId: blade, quantity: 1 }]),
  quoteSelectionKey([{ productId: guard, quantity: 1 }]),
);

assert.equal(
  quoteSelectionKey([{ productId: blade, quantity: 1 }]),
  quoteSelectionKey([
    { productId: blade, quantity: 1, price: 1 } as {
      productId: string;
      quantity: number;
    },
  ]),
);

const currentQuote: QuotePriceSnapshot = {
  subtotal: "150.00",
  lines: [
    { productId: guard, quantity: 1, unitPrice: "50" },
    { productId: blade, quantity: 2, unitPrice: "50.00" },
  ],
};

const reorderedQuote: QuotePriceSnapshot = {
  subtotal: "150",
  lines: [
    { productId: blade.toUpperCase(), quantity: 2, unitPrice: "50" },
    { productId: guard, quantity: 1, unitPrice: "50.0" },
  ],
};

assert.equal(quotePricesMatch(currentQuote, reorderedQuote), true);

const sameEffectivePrice = [
  { productId: blade, quantity: 2, unitPrice: "50", regularPrice: "1" },
  { productId: guard, quantity: 1, unitPrice: "50", regularPrice: "1" },
];

assert.equal(
  quotePricesMatch(currentQuote, {
    subtotal: "150",
    lines: sameEffectivePrice,
  }),
  true,
);

const changedUnitPrice = [
  { productId: blade, quantity: 2, unitPrice: "40", regularPrice: "50" },
  { productId: guard, quantity: 1, unitPrice: "50", regularPrice: "50" },
];

assert.equal(
  quotePricesMatch(currentQuote, {
    ...reorderedQuote,
    lines: changedUnitPrice,
  }),
  false,
);

assert.equal(
  quotePricesMatch(currentQuote, {
    subtotal: "100",
    lines: [
      { productId: blade, quantity: 1, unitPrice: "50" },
      { productId: guard, quantity: 1, unitPrice: "50" },
    ],
  }),
  false,
);

assert.equal(
  quotePricesMatch(currentQuote, {
    subtotal: "140",
    lines: currentQuote.lines,
  }),
  false,
);

assert.equal(
  quotePricesMatch(
    {
      subtotal: "50",
      lines: [{ productId: blade, quantity: 1, unitPrice: "50" }],
    },
    {
      subtotal: "50",
      lines: [
        { productId: blade, quantity: 1, unitPrice: "40" },
        { productId: blade, quantity: 1, unitPrice: "10" },
      ],
    },
  ),
  false,
);

const current = {
  generation: 2,
  selectionKey: selection,
};

assert.equal(
  isCurrentQuoteResponse(
    { generation: 2, selectionKey: selection },
    current,
  ),
  true,
);

assert.equal(
  isCurrentQuoteResponse(
    { generation: 1, selectionKey: selection },
    current,
  ),
  false,
);

assert.equal(
  isCurrentQuoteResponse(
    {
      generation: 2,
      selectionKey: quoteSelectionKey([{ productId: blade, quantity: 2 }]),
    },
    current,
  ),
  false,
);

assert.equal(
  isCurrentQuoteResponse(
    { generation: 1.5, selectionKey: selection },
    { generation: 1.5, selectionKey: selection },
  ),
  false,
);
