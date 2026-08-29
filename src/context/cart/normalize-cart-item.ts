import { CartItem } from "./types";

// =================================================
// NORMALIZE CART ITEM (legacy localStorage)
// =================================================

export function normalizeCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id.trim() : "";

  if (!id) {
    return null;
  }

  return {
    id,
    title: String(item.title ?? ""),
    price: Number(item.price) || 0,
    image: typeof item.image === "string" ? item.image : "/placeholder.png",
    quantity: Math.max(1, Number(item.quantity) || 1),
    stock: Math.max(0, Number(item.stock) || 0),
    selected: item.selected === false ? false : true,
  };
}

export function getSelectedItems(cartItems: CartItem[]): CartItem[] {
  return cartItems.filter((item) => item.selected);
}

export function areAllItemsSelected(cartItems: CartItem[]): boolean {
  return cartItems.length > 0 && cartItems.every((item) => item.selected);
}
