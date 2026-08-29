// =================================================
// DELIVERY RULES (checkout / createOrder)
// =================================================

/** Minimum selected / resolved order subtotal (GEL) required for delivery. */
export const DELIVERY_MIN_SUBTOTAL_GEL = 150;

export function isDeliverySubtotalAllowed(subtotal: number): boolean {
  return Number.isFinite(subtotal) && subtotal >= DELIVERY_MIN_SUBTOTAL_GEL;
}
