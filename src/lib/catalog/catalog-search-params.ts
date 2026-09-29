export const CATALOG_PAGE_SIZE = 20;
export const LATEST_PRODUCTS_LIMIT = 10;
export const HOME_DISCOVERY_LIMIT = 10;
export const SALE_PRODUCTS_SLIDER_LIMIT = 10;

export const CATALOG_STOCK_IN = "in-stock";
export const CATALOG_STOCK_OUT = "out-of-stock";

export type CatalogStockFilter = typeof CATALOG_STOCK_IN | typeof CATALOG_STOCK_OUT;

export type CatalogSortValue =
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export const CATALOG_SORT_OPTIONS: CatalogSortValue[] = [
  "oldest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
];

export type CatalogCategory = {
  id: number | string;
  name_ka: string;
  name_en: string;
};

export type CatalogBrandOption = {
  slug: string;
  name: string;
};

export type CatalogFilters = {
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
  brandSlug: string | null;
  stock: CatalogStockFilter | null;
  sort: CatalogSortValue | null;
};

export type CatalogSearchParamsInput = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  brand?: string;
  stock?: string;
  sort?: string;
};

export type CatalogQueryFields = {
  categoryId?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
  brandSlug?: string | null;
  stock?: CatalogStockFilter | null;
  sort?: CatalogSortValue | null;
};

function parseNonNegativeNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function parseBrandSlug(raw: string | undefined): string | null {
  const slug = raw?.trim() ?? "";
  return slug.length > 0 ? slug : null;
}

function parseCatalogStock(
  raw: string | undefined,
): CatalogStockFilter | null {
  const value = raw?.trim() ?? "";
  if (value === CATALOG_STOCK_IN || value === CATALOG_STOCK_OUT) {
    return value;
  }
  return null;
}

function parseCatalogSort(raw: string | undefined): CatalogSortValue | null {
  const value = raw?.trim() ?? "";
  if ((CATALOG_SORT_OPTIONS as string[]).includes(value)) {
    return value as CatalogSortValue;
  }
  return null;
}

/** Parse catalog filters from URL search params. Invalid min>max → both price bounds ignored. Invalid stock/sort → ignored (default). */
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

  return {
    categoryId,
    minPrice,
    maxPrice,
    page,
    brandSlug: parseBrandSlug(params.brand),
    stock: parseCatalogStock(params.stock),
    sort: parseCatalogSort(params.sort),
  };
}

export function catalogFiltersFromSearchParams(
  searchParams: { get: (name: string) => string | null },
): CatalogFilters {
  return parseCatalogSearchParams({
    category: searchParams.get("category") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    stock: searchParams.get("stock") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });
}

export function countActiveCatalogFilterGroups(filters: {
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  brandSlug?: string | null;
  stock?: CatalogStockFilter | null;
  sort?: CatalogSortValue | null;
}): number {
  let count = 0;
  if (filters.categoryId) count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  if (filters.brandSlug) count += 1;
  if (filters.sort) count += 1;
  return count;
}

/** Category, brand, and price — used for `/products` initial Filters collapsed state. */
export function hasActiveCatalogUiFilters(filters: {
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  brandSlug?: string | null;
}): boolean {
  return Boolean(
    filters.categoryId ||
      filters.brandSlug ||
      filters.minPrice !== null ||
      filters.maxPrice !== null,
  );
}

export function buildCatalogQueryString(filters: CatalogQueryFields): string {
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

  if (filters.brandSlug) {
    params.set("brand", filters.brandSlug);
  }

  if (filters.stock) {
    params.set("stock", filters.stock);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params.toString();
}

export function mergeCatalogQueryString(
  current: CatalogFilters,
  patch: CatalogQueryFields,
): string {
  return buildCatalogQueryString({
    categoryId:
      patch.categoryId !== undefined ? patch.categoryId : current.categoryId,
    minPrice:
      patch.minPrice !== undefined ? patch.minPrice : current.minPrice,
    maxPrice:
      patch.maxPrice !== undefined ? patch.maxPrice : current.maxPrice,
    brandSlug:
      patch.brandSlug !== undefined ? patch.brandSlug : current.brandSlug,
    stock: patch.stock !== undefined ? patch.stock : current.stock,
    sort: patch.sort !== undefined ? patch.sort : current.sort,
    page: patch.page ?? 1,
  });
}

export function isStorefrontBrandPlpPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/brands/") && pathname !== "/brands";
}

/** Home Filters navigate to the full catalog; other routes keep their path. */
export function catalogFilterTargetPath(pathname: string): string {
  return pathname === "/" ? "/products" : pathname;
}

export function buildCatalogFilterHref(
  pathname: string,
  searchParams: { get: (name: string) => string | null },
  patch: CatalogQueryFields,
): string {
  const current = catalogFiltersFromSearchParams(searchParams);
  const query = mergeCatalogQueryString(current, patch);
  const base = catalogFilterTargetPath(pathname);
  return query ? `${base}?${query}` : base;
}

/** Brand filter navigation: query param on Home/Products; Brand PLP keeps `/brands/[slug]`. */
export function buildCatalogBrandLocation(
  pathname: string,
  searchParams: { get: (name: string) => string | null },
  brandSlug: string | null,
): string {
  const current = catalogFiltersFromSearchParams(searchParams);

  if (isStorefrontBrandPlpPath(pathname)) {
    const query = mergeCatalogQueryString(current, {
      brandSlug: null,
      page: 1,
    });

    if (!brandSlug) {
      return query ? `/products?${query}` : "/products";
    }

    const path = `/brands/${encodeURIComponent(brandSlug)}`;
    return query ? `${path}?${query}` : path;
  }

  return buildCatalogFilterHref(pathname, searchParams, { brandSlug, page: 1 });
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
