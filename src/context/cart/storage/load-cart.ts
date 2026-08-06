import { CartItem } from "../types";

// =================================================
// LOAD CART
// =================================================

export function loadCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      return [];
    }

    return JSON.parse(savedCart);
  } catch (error) {
    console.log("Cart load error:", error);

    return [];
  }
}