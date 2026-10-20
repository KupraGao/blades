import type { PaymentMethod } from "@/lib/orders/payment-rules";
import { readBankPaymentRedirectUrl } from "@/lib/payments/bog/payment-redirect";

export type CheckoutPaymentNavigation =
  | { type: "bank"; redirectUrl: string }
  | { type: "success" }
  | { type: "error"; messageCode: "orderErrorPaymentStartFailed" };

/**
 * Decides where Checkout goes after the server action returns.
 * Online orders leave the store only for a validated bank URL.
 * Pay at pickup keeps the existing success page.
 */
export function resolveCheckoutPaymentNavigation(input: {
  paymentMethod: PaymentMethod;
  paymentRedirectUrl?: string | null;
}): CheckoutPaymentNavigation {
  if (input.paymentMethod !== "online") {
    return { type: "success" };
  }

  const redirectUrl = readBankPaymentRedirectUrl(input.paymentRedirectUrl);

  if (!redirectUrl) {
    return { type: "error", messageCode: "orderErrorPaymentStartFailed" };
  }

  return { type: "bank", redirectUrl };
}
