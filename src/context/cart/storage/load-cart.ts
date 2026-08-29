import { CartItem } from "../types";
import { normalizeCartItem } from "../normalize-cart-item";

// =================================================
// LOAD CART
// =================================================

export function loadCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      return [];
    }

    const parsed = JSON.parse(savedCart);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeCartItem(item))
      .filter((item): item is CartItem => item !== null);
  } catch (error) {
    console.log("Cart load error:", error);

    return [];
  }
}
