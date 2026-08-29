import { CartItem } from "../types";
import { getSelectedItems } from "../normalize-cart-item";

// =================================================
// CART TOTAL (all items — legacy semantics)
// =================================================

export function getCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

// =================================================
// SELECTED CART TOTAL (checkout / purchase UI)
// =================================================

export function getSelectedCartTotal(cartItems: CartItem[]): number {
  return getCartTotal(getSelectedItems(cartItems));
}
