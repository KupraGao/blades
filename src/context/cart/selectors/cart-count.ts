import { CartItem } from "../types";
import { getSelectedItems } from "../normalize-cart-item";

// =================================================
// CART COUNT (all items — header badge)
// =================================================

export function getCartCount(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// =================================================
// SELECTED CART COUNT (checkout / purchase UI)
// =================================================

export function getSelectedCartCount(cartItems: CartItem[]): number {
  return getCartCount(getSelectedItems(cartItems));
}
