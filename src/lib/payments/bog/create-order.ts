import { getBogAccessToken } from "./auth";
import { BOG_CREATE_ORDER_URL, assertBogServerOnly } from "./config";
import { providerFailure, isRecord, readJsonBody } from "./http";

export type BogCreateOrderLanguage = "ka" | "en";
export type BogCreateOrderCurrency = "GEL" | "USD" | "EUR" | "GBP";

export type BogCreateOrderBasketItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
  description?: string;
};

export type BogCreateOrderInput = {
  callback_url: string;
  external_order_id: string;
  purchase_units: {
    currency: BogCreateOrderCurrency;
    total_amount: number;
    basket: BogCreateOrderBasketItem[];
  };
  redirect_urls?: {
    success?: string;
    fail?: string;
  };
  language?: BogCreateOrderLanguage;
};

export type BogCreateOrderResult = {
  orderId: string;
  redirectUrl: string;
};

function requireNonEmptyString(value: string | undefined, label: string): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    throw providerFailure(
      "malformed",
      `BOG create-order ${label} is required.`,
    );
  }

  return trimmed;
}

function buildCreateOrderBody(input: BogCreateOrderInput): Record<string, unknown> {
  const callbackUrl = requireNonEmptyString(input.callback_url, "callback_url");
  const externalOrderId = requireNonEmptyString(
    input.external_order_id,
    "external_order_id",
  );
  const currency = requireNonEmptyString(
    input.purchase_units.currency,
    "purchase_units.currency",
  );
  const totalAmount = input.purchase_units.total_amount;

  if (typeof totalAmount !== "number" || !Number.isFinite(totalAmount)) {
    throw providerFailure(
      "malformed",
      "BOG create-order purchase_units.total_amount is invalid.",
    );
  }

  if (!Array.isArray(input.purchase_units.basket) || input.purchase_units.basket.length === 0) {
    throw providerFailure(
      "malformed",
      "BOG create-order purchase_units.basket is required.",
    );
  }

  const basket = input.purchase_units.basket.map((item) => {
    const productId = requireNonEmptyString(item.product_id, "basket.product_id");
    const quantity = item.quantity;
    const unitPrice = item.unit_price;

    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 1) {
      throw providerFailure(
        "malformed",
        "BOG create-order basket.quantity is invalid.",
      );
    }

    if (typeof unitPrice !== "number" || !Number.isFinite(unitPrice)) {
      throw providerFailure(
        "malformed",
        "BOG create-order basket.unit_price is invalid.",
      );
    }

    const row: Record<string, unknown> = {
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    };

    if (item.description !== undefined) {
      row.description = item.description;
    }

    return row;
  });

  const body: Record<string, unknown> = {
    callback_url: callbackUrl,
    external_order_id: externalOrderId,
    purchase_units: {
      currency,
      total_amount: totalAmount,
      basket,
    },
  };

  if (input.redirect_urls) {
    const redirectUrls: Record<string, string> = {};

    if (input.redirect_urls.success?.trim()) {
      redirectUrls.success = input.redirect_urls.success.trim();
    }

    if (input.redirect_urls.fail?.trim()) {
      redirectUrls.fail = input.redirect_urls.fail.trim();
    }

    if (Object.keys(redirectUrls).length > 0) {
      body.redirect_urls = redirectUrls;
    }
  }

  return body;
}

function readCreateOrderResult(payload: unknown): BogCreateOrderResult {
  if (!isRecord(payload) || typeof payload.id !== "string" || !payload.id.trim()) {
    throw providerFailure(
      "malformed",
      "BOG create-order returned an unexpected response.",
    );
  }

  const links = isRecord(payload._links) ? payload._links : null;
  const redirect = links && isRecord(links.redirect) ? links.redirect : null;
  const redirectUrl =
    redirect && typeof redirect.href === "string" ? redirect.href.trim() : "";

  if (!redirectUrl) {
    throw providerFailure(
      "malformed",
      "BOG create-order returned an unexpected response.",
    );
  }

  return {
    orderId: payload.id.trim(),
    redirectUrl,
  };
}

export async function createBogOrder(
  input: BogCreateOrderInput,
): Promise<BogCreateOrderResult> {
  assertBogServerOnly();

  const accessToken = await getBogAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (input.language) {
    headers["Accept-Language"] = input.language;
  }

  let response: Response;

  try {
    response = await fetch(BOG_CREATE_ORDER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(buildCreateOrderBody(input)),
      cache: "no-store",
    });
  } catch (cause) {
    throw providerFailure(
      "network",
      "BOG create-order request failed.",
      undefined,
      cause,
    );
  }

  if (!response.ok) {
    throw providerFailure(
      response.status === 401 || response.status === 403
        ? "authentication"
        : "network",
      "BOG create-order request failed.",
      response.status,
    );
  }

  const payload = await readJsonBody(response);
  return readCreateOrderResult(payload);
}
