import { CartItem } from "../types";

// =================================================
// TOGGLE / SET SELECTION
// =================================================

export function toggleItemSelected({
  currentItems,
  id,
}: {
  currentItems: CartItem[];
  id: string;
}): CartItem[] {
  return currentItems.map((item) =>
    item.id === id
      ? {
          ...item,
          selected: !item.selected,
        }
      : item,
  );
}

export function setAllSelected({
  currentItems,
  selected,
}: {
  currentItems: CartItem[];
  selected: boolean;
}): CartItem[] {
  return currentItems.map((item) => ({
    ...item,
    selected,
  }));
}

export function removeItemsByIds({
  currentItems,
  ids,
}: {
  currentItems: CartItem[];
  ids: string[];
}): CartItem[] {
  if (ids.length === 0) {
    return currentItems;
  }

  const idSet = new Set(ids);

  return currentItems.filter((item) => !idSet.has(item.id));
}
