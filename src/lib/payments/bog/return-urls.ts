import { BogError } from "./errors";

const ORDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BogCheckoutReturnUrls = {
  success: string;
  fail: string;
};

function invalidReturnUrl(): never {
  throw new BogError("malformed", "BOG return URL is invalid.");
}

/**
 * Builds the documented redirect_urls.success and redirect_urls.fail
 * values from the configured callback origin. Both point at the same
 * store page. The bank's choice of URL is not a payment confirmation.
 */
export function buildBogCheckoutReturnUrls(
  callbackUrl: string,
  orderId: string,
): BogCheckoutReturnUrls {
  let callback: URL;

  try {
    callback = new URL(callbackUrl);
  } catch {
    invalidReturnUrl();
  }

  if (
    callback.protocol !== "https:" ||
    callback.username ||
    callback.password ||
    !callback.hostname
  ) {
    invalidReturnUrl();
  }

  const id = orderId.trim();

  if (!ORDER_UUID.test(id)) {
    invalidReturnUrl();
  }

  const success = new URL(`/checkout/payment/${id}`, callback.origin).href;

  return {
    success,
    fail: success,
  };
}
