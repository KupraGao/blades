import { getBogAccessToken } from "./auth";
import { tagBankOrderDispatch } from "./bank-order-dispatch";
import {
  assertBogServerOnly,
  getBogCreateOrderUrl,
  getBogPaymentRedirectHost,
} from "./config";
import { providerFailure, isRecord, readJsonBody } from "./http";

export type BogCreateOrderLanguage = "ka" | "en";
export type BogCreateOrderCurrency = "GEL" | "USD" | "EUR" | "GBP";
export type BogCreateOrderCapture = "automatic" | "manual";

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
  capture?: BogCreateOrderCapture;
  ttl?: number;
  idempotencyKey: string;
};

export type BogCreateOrderResult = {
  orderId: string;
  redirectUrl: string;
};

const CURRENCIES: readonly BogCreateOrderCurrency[] = [
  "GEL",
  "USD",
  "EUR",
  "GBP",
];

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

function invalid(label: string): never {
  throw providerFailure(
    "malformed",
    `BOG create-order ${label} is invalid.`,
  );
}

function unexpectedResponse(): never {
  throw providerFailure(
    "malformed",
    "BOG create-order returned an unexpected response.",
  );
}

const IDEMPOTENCY_KEY_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertIdempotencyKey(value: string): string {
  const key = requireNonEmptyString(value, "idempotencyKey");

  if (!IDEMPOTENCY_KEY_V4.test(key)) {
    invalid("idempotencyKey");
  }

  return key;
}

export function buildCreateOrderHeaders(
  accessToken: string,
  idempotencyKey: string,
  language?: BogCreateOrderLanguage,
): Record<string, string> {
  const key = assertIdempotencyKey(idempotencyKey);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Idempotency-Key": key,
  };

  if (language) {
    headers["Accept-Language"] = language;
  }

  return headers;
}

function assertAbsoluteHttpsUrl(value: string, label: string): string {
  const trimmed = requireNonEmptyString(value, label);
  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    invalid(label);
  }

  if (url.protocol !== "https:" || url.username || url.password || !url.hostname) {
    invalid(label);
  }

  return trimmed;
}

function lariToTetri(amount: number, label: string): number {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    invalid(label);
  }

  const scaled = amount * 100;
  const tetri = Math.round(scaled);

  if (
    !Number.isSafeInteger(tetri) ||
    tetri <= 0 ||
    Math.abs(scaled - tetri) > 1e-6
  ) {
    invalid(label);
  }

  return tetri;
}

function assertQuantity(quantity: number): number {
  if (
    typeof quantity !== "number" ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) {
    invalid("basket.quantity");
  }

  return quantity;
}

function assertTtl(value: number): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 2 ||
    value > 1440
  ) {
    invalid("ttl");
  }

  return value;
}

function assertCurrency(value: string): BogCreateOrderCurrency {
  if (!(CURRENCIES as readonly string[]).includes(value)) {
    invalid("purchase_units.currency");
  }

  return value as BogCreateOrderCurrency;
}

export function buildCreateOrderBody(
  input: BogCreateOrderInput,
): Record<string, unknown> {
  const callbackUrl = assertAbsoluteHttpsUrl(input.callback_url, "callback_url");
  const externalOrderId = requireNonEmptyString(
    input.external_order_id,
    "external_order_id",
  );
  const currency = assertCurrency(
    requireNonEmptyString(
      input.purchase_units.currency,
      "purchase_units.currency",
    ),
  );
  const totalTetri = lariToTetri(
    input.purchase_units.total_amount,
    "purchase_units.total_amount",
  );

  if (!Array.isArray(input.purchase_units.basket) || input.purchase_units.basket.length === 0) {
    throw providerFailure(
      "malformed",
      "BOG create-order purchase_units.basket is required.",
    );
  }

  let basketTetri = 0;
  const basket = input.purchase_units.basket.map((item) => {
    const productId = requireNonEmptyString(item.product_id, "basket.product_id");
    const quantity = assertQuantity(item.quantity);
    const unitTetri = lariToTetri(item.unit_price, "basket.unit_price");
    const lineTetri = unitTetri * quantity;

    if (!Number.isSafeInteger(lineTetri)) {
      invalid("basket.unit_price");
    }

    basketTetri += lineTetri;

    if (!Number.isSafeInteger(basketTetri)) {
      invalid("purchase_units.total_amount");
    }

    const row: Record<string, unknown> = {
      product_id: productId,
      quantity,
      unit_price: unitTetri / 100,
    };

    if (item.description !== undefined) {
      row.description = item.description;
    }

    return row;
  });

  if (basketTetri !== totalTetri) {
    invalid("purchase_units.total_amount");
  }

  const body: Record<string, unknown> = {
    callback_url: callbackUrl,
    external_order_id: externalOrderId,
    purchase_units: {
      currency,
      total_amount: totalTetri / 100,
      basket,
    },
  };

  if (input.redirect_urls) {
    const redirectUrls: Record<string, string> = {};

    if (input.redirect_urls.success?.trim()) {
      redirectUrls.success = assertAbsoluteHttpsUrl(
        input.redirect_urls.success,
        "redirect_urls.success",
      );
    }

    if (input.redirect_urls.fail?.trim()) {
      redirectUrls.fail = assertAbsoluteHttpsUrl(
        input.redirect_urls.fail,
        "redirect_urls.fail",
      );
    }

    if (Object.keys(redirectUrls).length > 0) {
      body.redirect_urls = redirectUrls;
    }
  }

  if (input.capture !== undefined) {
    if (input.capture !== "automatic" && input.capture !== "manual") {
      invalid("capture");
    }

    body.capture = input.capture;
  }

  if (input.ttl !== undefined) {
    body.ttl = assertTtl(input.ttl);
  }

  return body;
}

export function readCreateOrderResult(payload: unknown): BogCreateOrderResult {
  if (!isRecord(payload) || typeof payload.id !== "string" || !payload.id.trim()) {
    unexpectedResponse();
  }

  const links = isRecord(payload._links) ? payload._links : null;
  const redirect = links && isRecord(links.redirect) ? links.redirect : null;
  const redirectUrl =
    redirect && typeof redirect.href === "string" ? redirect.href.trim() : "";

  if (!redirectUrl) {
    unexpectedResponse();
  }

  let url: URL;

  try {
    url = new URL(redirectUrl);
  } catch {
    unexpectedResponse();
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname ||
    url.port !== "" ||
    url.hostname !== getBogPaymentRedirectHost()
  ) {
    unexpectedResponse();
  }

  return {
    orderId: payload.id.trim(),
    redirectUrl,
  };
}

export async function createBogOrder(
  input: BogCreateOrderInput,
  options?: { beforeCreateOrder?: () => Promise<void> },
): Promise<BogCreateOrderResult> {
  assertBogServerOnly();

  const idempotencyKey = assertIdempotencyKey(input.idempotencyKey);
  const requestBody = buildCreateOrderBody(input);
  let accessToken: string;

  try {
    accessToken = await getBogAccessToken();
  } catch (error) {
    if (error instanceof Error) {
      throw tagBankOrderDispatch(error, "unsent");
    }

    throw error;
  }

  if (options?.beforeCreateOrder) {
    try {
      await options.beforeCreateOrder();
    } catch (error) {
      const failure =
        error instanceof Error
          ? error
          : new Error("BOG create-order attempt was not recorded.");

      throw tagBankOrderDispatch(failure, "uncertain");
    }
  }

  const headers = buildCreateOrderHeaders(
    accessToken,
    idempotencyKey,
    input.language,
  );

  let response: Response;

  try {
    response = await fetch(getBogCreateOrderUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });
  } catch (cause) {
    throw tagBankOrderDispatch(
      providerFailure(
        "network",
        "BOG create-order request failed.",
        undefined,
        cause,
      ),
      "uncertain",
    );
  }

  if (!response.ok) {
    throw tagBankOrderDispatch(
      providerFailure(
        response.status === 401 || response.status === 403
          ? "authentication"
          : "network",
        "BOG create-order request failed.",
        response.status,
      ),
      "uncertain",
    );
  }

  try {
    const payload = await readJsonBody(response);
    return readCreateOrderResult(payload);
  } catch (error) {
    if (error instanceof Error) {
      throw tagBankOrderDispatch(error, "uncertain");
    }

    throw error;
  }
}
