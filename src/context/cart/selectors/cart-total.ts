import { CartItem } from "../types";

// =================================================
// CART TOTAL
// =================================================

export function getCartTotal(
  cartItems: CartItem[]
): number {
  return cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );
}