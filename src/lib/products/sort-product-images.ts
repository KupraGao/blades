type SortableProductImage = {
  is_main?: boolean | null;
  sort_order?: number | null;
};

export const PRODUCT_IMAGES_NESTED_ORDER = {
  referencedTable: "product_images",
  ascending: true,
} as const;

export function sortProductImages<T extends SortableProductImage>(
  images: T[] | null | undefined,
): T[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return [...images].sort((left, right) => {
    const leftOrder =
      typeof left.sort_order === "number"
        ? left.sort_order
        : left.is_main
          ? 0
          : Number.MAX_SAFE_INTEGER;
    const rightOrder =
      typeof right.sort_order === "number"
        ? right.sort_order
        : right.is_main
          ? 0
          : Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder;
  });
}
