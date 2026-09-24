export const CATALOG_PAGE_SIZE = 20;
export const LATEST_PRODUCTS_LIMIT = 10;
export const SALE_PRODUCTS_SLIDER_LIMIT = 10;

export type CatalogCategory = {
  id: number | string;
  name_ka: string;
  name_en: string;
};

export type CatalogFilters = {
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
};

export type CatalogSearchParamsInput = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

function parseNonNegativeNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

/** Parse Home catalog filters from URL search params. Invalid min>max → both price bounds ignored for query safety. */
export function parseCatalogSearchParams(
  params: CatalogSearchParamsInput,
): CatalogFilters {
  const categoryRaw = params.category?.trim() ?? "";
  const categoryId = categoryRaw.length > 0 ? categoryRaw : null;

  let minPrice = parseNonNegativeNumber(params.minPrice);
  let maxPrice = parseNonNegativeNumber(params.maxPrice);

  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    minPrice = null;
    maxPrice = null;
  }

  const pageRaw = Number(params.page);
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  return { categoryId, minPrice, maxPrice, page };
}

export function countActiveCatalogFilterGroups(filters: {
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}): number {
  let count = 0;
  if (filters.categoryId) count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  return count;
}

export function buildCatalogQueryString(filters: {
  categoryId?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (filters.categoryId) {
    params.set("category", filters.categoryId);
  }

  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params.toString();
}

/** Compact page list: 1 … n with ellipsis for large totals. */
export function getCatalogPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "ellipsis"> = [];
  const push = (value: number | "ellipsis") => {
    if (items[items.length - 1] !== value) items.push(value);
  };

  push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) push("ellipsis");

  for (let page = start; page <= end; page++) {
    push(page);
  }

  if (end < totalPages - 1) push("ellipsis");

  push(totalPages);

  return items;
}
