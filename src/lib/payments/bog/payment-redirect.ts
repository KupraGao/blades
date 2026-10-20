const BANK_PAYMENT_HOSTS = new Set([
  "payment.bog.ge",
  "payment-sandbox.bog.ge",
]);

/**
 * Accepts only an absolute https URL on the bank payment host.
 * The caller must still pin the host to the active BOG environment.
 */
export function readBankPaymentRedirectUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    url.port !== "" ||
    !BANK_PAYMENT_HOSTS.has(url.hostname)
  ) {
    return null;
  }

  return trimmed;
}
