import { CartItem } from "../types";

// =================================================
// INCREASE QUANTITY
// =================================================

type IncreaseQuantityParams = {
  currentItems: CartItem[];
  id: string;
};

export function increaseQuantity({
  currentItems,
  id,
}: IncreaseQuantityParams): CartItem[] {
  return currentItems.map((item) => {
    if (item.id !== id) {
      return item;
    }

    // =====================================
    // MAX STOCK
    // =====================================

    if (item.quantity >= item.stock) {
      return item;
    }

    return {
      ...item,
      quantity: item.quantity + 1,
    };
  });
}