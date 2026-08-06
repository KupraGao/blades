import { CartItem } from "../types";

// =================================================
// CART COUNT
// =================================================

export function getCartCount(
  cartItems: CartItem[]
): number {
  return cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
}