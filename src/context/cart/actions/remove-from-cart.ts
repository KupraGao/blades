import { CartItem } from "../types";

// =================================================
// REMOVE FROM CART
// =================================================

type RemoveFromCartParams = {
  currentItems: CartItem[];
  id: string;
};

export function removeFromCart({
  currentItems,
  id,
}: RemoveFromCartParams): CartItem[] {
  return currentItems.filter(
    (item) => item.id !== id
  );
}