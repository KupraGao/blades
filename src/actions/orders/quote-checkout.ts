"use server";

import { createClient } from "@/lib/supabase/server";
import { consolidateOrderItems } from "@/lib/orders/validate-order";
import {
  quoteCheckout,
  type QuoteCheckoutErrorCode,
  type QuoteCheckoutLine,
  type QuoteCheckoutProduct,
} from "@/lib/orders/quote-checkout";

const MAX_QUANTITY = 2147483647;
const UUID_TEXT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type QuoteCheckoutActionLine = {
  productId: string;
  quantity: number;
};

export type QuoteCheckoutActionErrorCode =
  | QuoteCheckoutErrorCode
  | "invalid_product_id"
  | "quote_unavailable";

export type QuoteCheckoutActionResult =
  | {
      ok: true;
      lines: QuoteCheckoutLine[];
      subtotal: string;
      deliveryAllowed: boolean;
    }
  | {
      ok: false;
      error: {
        code: QuoteCheckoutActionErrorCode;
        productId: string | null;
        title: string | null;
      };
    };

function actionError(
  code: QuoteCheckoutActionErrorCode,
  productId: string | null = null,
  title: string | null = null,
): QuoteCheckoutActionResult {
  return {
    ok: false,
    error: { code, productId, title },
  };
}

function isLine(value: unknown): value is QuoteCheckoutActionLine {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const line = value as { productId?: unknown; quantity?: unknown };

  return (
    typeof line.productId === "string" &&
    typeof line.quantity === "number"
  );
}

function validQuantity(quantity: number): boolean {
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_QUANTITY
  );
}

function readMoney(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }

  return null;
}

function readStock(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());

    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
}

function readProduct(row: unknown): QuoteCheckoutProduct | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return null;
  }

  const record = row as {
    id?: unknown;
    title?: unknown;
    price?: unknown;
    sale_price?: unknown;
    stock?: unknown;
  };

  if (typeof record.id !== "string" || !UUID_TEXT.test(record.id.trim())) {
    return null;
  }

  const price = readMoney(record.price);

  if (!price) {
    return {
      id: record.id.trim().toLowerCase(),
      title: typeof record.title === "string" ? record.title : "",
      price: "",
      salePrice: null,
      stock: readStock(record.stock),
    };
  }

  return {
    id: record.id.trim().toLowerCase(),
    title: typeof record.title === "string" ? record.title : "",
    price,
    salePrice:
      record.sale_price === null || record.sale_price === undefined
        ? null
        : (readMoney(record.sale_price) ?? "invalid"),
    stock: readStock(record.stock),
  };
}

// Display quote only. create_checkout_order remains the payable total.
export async function quoteCheckoutOrder(
  lines: readonly QuoteCheckoutActionLine[],
): Promise<QuoteCheckoutActionResult> {
  if (!Array.isArray(lines)) {
    return actionError("invalid_product_id");
  }

  if (lines.length === 0) {
    return actionError("empty_cart");
  }

  const requested: QuoteCheckoutActionLine[] = [];

  for (const line of lines) {
    if (!isLine(line)) {
      return actionError("invalid_product_id");
    }

    const productId = line.productId.trim().toLowerCase();

    if (!UUID_TEXT.test(productId)) {
      return actionError("invalid_product_id", productId || null);
    }

    if (!validQuantity(line.quantity)) {
      return actionError("invalid_quantity", productId);
    }

    requested.push({
      productId,
      quantity: line.quantity,
    });
  }

  const consolidated = consolidateOrderItems(requested);

  for (const line of consolidated) {
    if (!validQuantity(line.quantity)) {
      return actionError("invalid_quantity", line.productId);
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, sale_price, stock")
    .in(
      "id",
      consolidated.map((line) => line.productId),
    );

  if (error) {
    console.error("quoteCheckoutOrder read error", {
      code: error.code ?? null,
    });
    return actionError("quote_unavailable");
  }

  const products = (data ?? [])
    .map((row) => readProduct(row))
    .filter((row): row is QuoteCheckoutProduct => row !== null);

  const quote = quoteCheckout(products, consolidated);

  if (!quote.ok) {
    return actionError(
      quote.error.code,
      quote.error.productId,
      quote.error.title,
    );
  }

  return {
    ok: true,
    lines: quote.quote.lines,
    subtotal: quote.quote.subtotal,
    deliveryAllowed: quote.quote.deliveryAllowed,
  };
}
