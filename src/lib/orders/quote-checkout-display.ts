const DECIMAL_TEXT = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

type Decimal = {
  digits: bigint;
  scale: number;
};

export type QuoteSelectionLine = {
  productId: string;
  quantity: number;
};

export type QuotePriceLine = {
  productId: string;
  quantity: number;
  unitPrice: string;
};

export type QuotePriceSnapshot = {
  subtotal: string;
  lines: readonly QuotePriceLine[];
};

export type QuoteResponseIdentity = {
  generation: number;
  selectionKey: string;
};

function normalizeProductId(productId: string): string {
  return productId.trim().toLowerCase();
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

function sameMoney(left: string, right: string): boolean {
  const leftDecimal = parseDecimal(left);
  const rightDecimal = parseDecimal(right);

  if (!leftDecimal || !rightDecimal) {
    return left === right;
  }

  const scale = Math.max(leftDecimal.scale, rightDecimal.scale);

  return scaledDigits(leftDecimal, scale) === scaledDigits(rightDecimal, scale);
}

function integerQuantity(quantity: number): bigint | null {
  if (!Number.isSafeInteger(quantity)) {
    return null;
  }

  return BigInt(quantity);
}

export function quoteSelectionKey(
  lines: readonly QuoteSelectionLine[],
): string {
  const quantities = new Map<string, bigint>();
  const irregular = new Map<string, string[]>();

  for (const line of lines) {
    const productId = normalizeProductId(line.productId);
    const quantity = integerQuantity(line.quantity);

    if (quantity === null || irregular.has(productId)) {
      const tokens = irregular.get(productId) ?? [];
      const stored = quantities.get(productId);

      if (stored !== undefined) {
        tokens.push(`i:${stored.toString()}`);
        quantities.delete(productId);
      }

      tokens.push(
        quantity === null
          ? `n:${String(line.quantity)}`
          : `i:${quantity.toString()}`,
      );
      irregular.set(productId, tokens);
      continue;
    }

    quantities.set(productId, (quantities.get(productId) ?? BigInt(0)) + quantity);
  }

  const entries: [string, string][] = [];

  for (const [productId, quantity] of quantities) {
    entries.push([productId, quantity.toString()]);
  }

  for (const [productId, tokens] of irregular) {
    entries.push([productId, [...tokens].sort().join(",")]);
  }

  entries.sort((left, right) =>
    left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0,
  );

  return JSON.stringify(entries);
}

function normalizedLines(
  lines: readonly QuotePriceLine[],
): Map<string, { quantity: number; unitPrice: string }> | null {
  const normalized = new Map<
    string,
    { quantity: number; unitPrice: string }
  >();

  for (const line of lines) {
    const productId = normalizeProductId(line.productId);

    if (normalized.has(productId)) {
      return null;
    }

    normalized.set(productId, {
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    });
  }

  return normalized;
}

export function quotePricesMatch(
  current: QuotePriceSnapshot,
  next: QuotePriceSnapshot,
): boolean {
  if (!sameMoney(current.subtotal, next.subtotal)) {
    return false;
  }

  const currentLines = normalizedLines(current.lines);
  const nextLines = normalizedLines(next.lines);

  if (!currentLines || !nextLines || currentLines.size !== nextLines.size) {
    return false;
  }

  for (const [productId, line] of currentLines) {
    const other = nextLines.get(productId);

    if (!other || other.quantity !== line.quantity) {
      return false;
    }

    if (!sameMoney(line.unitPrice, other.unitPrice)) {
      return false;
    }
  }

  return true;
}

export function isCurrentQuoteResponse(
  response: QuoteResponseIdentity,
  current: QuoteResponseIdentity,
): boolean {
  return (
    Number.isSafeInteger(response.generation) &&
    response.generation === current.generation &&
    response.selectionKey === current.selectionKey
  );
}
