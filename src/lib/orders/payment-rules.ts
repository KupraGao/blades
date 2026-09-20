// =================================================
// PAYMENT METHOD RULES (checkout / createOrder)
// =================================================
// Allowed combinations:
//   delivery + online
//   pickup + online
//   pickup + pay_at_pickup
// Invalid:
//   delivery + pay_at_pickup
//   cash_on_delivery / any other method — not supported
// =================================================

export type PaymentMethod = "online" | "pay_at_pickup";

export type FulfillmentMethodForPayment = "delivery" | "pickup";

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "online";

/** Authoritative create-order payment status for S7B (no provider yet). */
export const CREATE_ORDER_PAYMENT_STATUS = "unpaid" as const;

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "online",
  "pay_at_pickup",
];

export function isPaymentMethod(
  value: unknown,
): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export function isValidFulfillmentPaymentCombination(
  fulfillmentMethod: FulfillmentMethodForPayment,
  paymentMethod: PaymentMethod,
): boolean {
  if (fulfillmentMethod === "delivery") {
    return paymentMethod === "online";
  }

  if (fulfillmentMethod === "pickup") {
    return (
      paymentMethod === "online" ||
      paymentMethod === "pay_at_pickup"
    );
  }

  return false;
}
