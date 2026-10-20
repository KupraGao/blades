import {
  DELIVERY_MIN_SUBTOTAL_GEL,
  isDeliverySubtotalAllowed,
} from "@/lib/orders/delivery-rules";
import { consolidateOrderItems } from "@/lib/orders/validate-order";
import { getEffectiveProductPrice } from "@/lib/products/pricing";

const MAX_QUANTITY = 2147483647;
const DECIMAL_TEXT = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const ZERO: Decimal = { digits: BigInt(0), scale: 0 };

type Decimal = {
  digits: bigint;
  scale: number;
};

export type QuoteCheckoutProduct = {
  id: string;
  title: string;
  price: string;
  salePrice: string | null;
  stock: number | null;
};

export type QuoteCheckoutLineInput = {
  productId: string;
  quantity: number;
};

export type QuoteCheckoutLine = {
  productId: string;
  title: string;
  regularPrice: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
};

export type QuoteCheckout = {
  lines: QuoteCheckoutLine[];
  subtotal: string;
  deliveryAllowed: boolean;
};

export type QuoteCheckoutErrorCode =
  | "empty_cart"
  | "invalid_quantity"
  | "missing_product"
  | "unavailable_stock"
  | "invalid_price"
  | "empty_title"
  | "insufficient_stock";

export type QuoteCheckoutError = {
  code: QuoteCheckoutErrorCode;
  productId: string | null;
  title: string | null;
};

export type QuoteCheckoutResult =
  | { ok: true; quote: QuoteCheckout }
  | { ok: false; error: QuoteCheckoutError };

function failure(
  code: QuoteCheckoutErrorCode,
  productId: string | null = null,
  title: string | null = null,
): QuoteCheckoutResult {
  return {
    ok: false,
    error: { code, productId, title },
  };
}

function parseDecimal(value: string): Decimal | null {
  const text = value.trim();

  if (!DECIMAL_TEXT.test(text)) {
    return null;
  }

  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;
  const [whole, fraction = ""] = unsigned.split(".");
  const digits = BigInt(whole + fraction);

  return {
    digits: negative ? -digits : digits,
    scale: fraction.length,
  };
}

function scaledDigits(value: Decimal, scale: number): bigint {
  return value.digits * BigInt(10) ** BigInt(scale - value.scale);
}

function compareDecimal(left: Decimal, right: Decimal): number {
  const scale = Math.max(left.scale, right.scale);
  const leftDigits = scaledDigits(left, scale);
  const rightDigits = scaledDigits(right, scale);

  if (leftDigits < rightDigits) {
    return -1;
  }

  if (leftDigits > rightDigits) {
    return 1;
  }

  return 0;
}

function addDecimal(left: Decimal, right: Decimal): Decimal {
  const scale = Math.max(left.scale, right.scale);

  return {
    digits: scaledDigits(left, scale) + scaledDigits(right, scale),
    scale,
  };
}

function multiplyDecimal(value: Decimal, quantity: number): Decimal {
  return {
    digits: value.digits * BigInt(quantity),
    scale: value.scale,
  };
}

function formatDecimal(value: Decimal): string {
  const negative = value.digits < BigInt(0);
  const digits = negative ? -value.digits : value.digits;

  if (value.scale === 0) {
    return `${negative ? "-" : ""}${digits.toString()}`;
  }

  const text = digits.toString().padStart(value.scale + 1, "0");
  const whole = text.slice(0, -value.scale);
  const fraction = text.slice(-value.scale).replace(/0+$/, "");
  const body = fraction.length > 0 ? `${whole}.${fraction}` : whole;

  return `${negative ? "-" : ""}${body}`;
}

function decimalFromNumber(value: number): Decimal | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  return parseDecimal(value.toString());
}

function selectUnitPrice(price: Decimal, sale: Decimal | null): Decimal {
  const regularNumber = Number(formatDecimal(price));
  const saleNumber = sale === null ? null : Number(formatDecimal(sale));
  const effective = getEffectiveProductPrice({
    price: regularNumber,
    sale_price: saleNumber,
  });

  if (sale && saleNumber !== null && effective === saleNumber) {
    return sale;
  }

  if (effective === regularNumber) {
    return price;
  }

  if (
    sale &&
    compareDecimal(sale, ZERO) > 0 &&
    compareDecimal(sale, price) < 0
  ) {
    return sale;
  }

  return price;
}

function deliveryAllowed(subtotal: Decimal): boolean {
  const text = formatDecimal(subtotal);
  const asNumber = Number(text);
  const roundTrip = decimalFromNumber(asNumber);

  if (
    roundTrip &&
    compareDecimal(subtotal, roundTrip) === 0
  ) {
    return isDeliverySubtotalAllowed(asNumber);
  }

  const threshold = parseDecimal(String(DELIVERY_MIN_SUBTOTAL_GEL));

  return threshold !== null && compareDecimal(subtotal, threshold) >= 0;
}

function validQuantity(quantity: number): boolean {
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_QUANTITY
  );
}

export function quoteCheckout(
  products: readonly QuoteCheckoutProduct[],
  lines: readonly QuoteCheckoutLineInput[],
): QuoteCheckoutResult {
  if (lines.length === 0) {
    return failure("empty_cart");
  }

  for (const line of lines) {
    if (!validQuantity(line.quantity)) {
      return failure("invalid_quantity", line.productId.trim() || null);
    }
  }

  const consolidated = consolidateOrderItems(
    lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
  );

  for (const line of consolidated) {
    if (!validQuantity(line.quantity)) {
      return failure("invalid_quantity", line.productId || null);
    }
  }

  const productsById = new Map<string, QuoteCheckoutProduct>();

  for (const product of products) {
    const id = product.id.trim();

    if (!productsById.has(id)) {
      productsById.set(id, product);
    }
  }

  const requestedIds = consolidated
    .map((line) => line.productId)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  const quantityById = new Map(
    consolidated.map((line) => [line.productId, line.quantity]),
  );
  const priced: QuoteCheckoutLine[] = [];
  let subtotal: Decimal = { digits: BigInt(0), scale: 0 };

  for (const productId of requestedIds) {
    const product = productsById.get(productId);

    if (!product) {
      continue;
    }

    const quantity = quantityById.get(productId) ?? 0;
    const title = product.title.trim();

    if (product.stock === null) {
      return failure("unavailable_stock", productId, title || null);
    }

    if (!Number.isSafeInteger(product.stock)) {
      return failure("unavailable_stock", productId, title || null);
    }

    const price = parseDecimal(product.price);

    if (!price || compareDecimal(price, ZERO) < 0) {
      return failure("invalid_price", productId, title || null);
    }

    if (!title) {
      return failure("empty_title", productId, null);
    }

    if (product.stock < quantity) {
      return failure("insufficient_stock", productId, title);
    }

    let sale: Decimal | null = null;

    if (product.salePrice !== null) {
      sale = parseDecimal(product.salePrice);

      if (!sale) {
        return failure("invalid_price", productId, title);
      }
    }

    const unitPrice = selectUnitPrice(price, sale);
    const lineTotal = multiplyDecimal(unitPrice, quantity);

    priced.push({
      productId,
      title,
      regularPrice: formatDecimal(price),
      unitPrice: formatDecimal(unitPrice),
      quantity,
      lineTotal: formatDecimal(lineTotal),
    });
    subtotal = addDecimal(subtotal, lineTotal);
  }

  if (priced.length !== requestedIds.length) {
    const missingId =
      requestedIds.find((productId) => !productsById.has(productId)) ?? null;

    return failure("missing_product", missingId);
  }

  return {
    ok: true,
    quote: {
      lines: priced,
      subtotal: formatDecimal(subtotal),
      deliveryAllowed: deliveryAllowed(subtotal),
    },
  };
}
