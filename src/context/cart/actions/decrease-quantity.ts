import { CartItem } from "../types";

// =================================================
// DECREASE QUANTITY
// =================================================

type DecreaseQuantityParams = {
  currentItems: CartItem[];
  id: string;
};

export function decreaseQuantity({
  currentItems,
  id,
}: DecreaseQuantityParams): CartItem[] {
  return currentItems.map((item) => {
    if (item.id !== id) {
      return item;
    }

    // =====================================
    // MIN QUANTITY
    // =====================================

    if (item.quantity <= 1) {
      return item;
    }

    return {
      ...item,
      quantity: item.quantity - 1,
    };
  });
}