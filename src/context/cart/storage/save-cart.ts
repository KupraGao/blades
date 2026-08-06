import { CartItem } from "../types";

// =================================================
// SAVE CART
// =================================================

export function saveCart(
  cartItems: CartItem[]
) {
  try {
    localStorage.setItem(
      "cart",
      JSON.stringify(cartItems)
    );
  } catch (error) {
    console.log("Cart save error:", error);
  }
}