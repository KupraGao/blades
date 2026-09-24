import { en } from "@/dictionaries/en";
import { ka } from "@/dictionaries/ka";
import type { CatalogCategory, CatalogFilters } from "@/lib/catalog/catalog-search-params";

/** Stable URL value for the virtual storefront sale filter. Not a category UUID. */
export const SALE_CATALOG_FILTER_VALUE = "sale";

type NamedCategory = {
  id?: unknown;
  name_ka?: string | null;
  name_en?: string | null;
};

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Identify the obsolete catalog Discount category by localized names only.
 * Categories have no slug. Do not hardcode a database UUID.
 */
export function isObsoleteDiscountCategory(category: NamedCategory): boolean {
  const nameKa = (category.name_ka ?? "").trim();
  const nameEn = normalizeName(category.name_en);

  return (
    nameKa === ka.sale ||
    nameEn === "discount" ||
    nameEn === "sale"
  );
}

export function getObsoleteDiscountCategoryId(
  categories: NamedCategory[],
): string | null {
  const match = categories.find(isObsoleteDiscountCategory);
  return match?.id == null ? null : String(match.id);
}

export function isSaleCatalogFilter(
  categoryParam: string | null | undefined,
  obsoleteDiscountCategoryId?: string | null,
): boolean {
  if (!categoryParam) {
    return false;
  }

  if (categoryParam === SALE_CATALOG_FILTER_VALUE) {
    return true;
  }

  return (
    Boolean(obsoleteDiscountCategoryId) &&
    categoryParam === obsoleteDiscountCategoryId
  );
}

export function withoutObsoleteDiscountCategories<T extends NamedCategory>(
  categories: T[],
): T[] {
  return categories.filter((category) => !isObsoleteDiscountCategory(category));
}

export function toStorefrontFilterCategories(
  categories: CatalogCategory[],
): CatalogCategory[] {
  const saleEntry: CatalogCategory = {
    id: SALE_CATALOG_FILTER_VALUE,
    name_ka: ka.sale,
    name_en: en.sale,
  };

  let replaced = false;
  const next: CatalogCategory[] = [];

  for (const category of categories) {
    if (!isObsoleteDiscountCategory(category)) {
      next.push(category);
      continue;
    }

    if (!replaced) {
      next.push(saleEntry);
      replaced = true;
    }
  }

  if (!replaced) {
    next.unshift(saleEntry);
  }

  return next;
}

export function resolveStorefrontCatalogQuery(
  filters: CatalogFilters,
  categories: NamedCategory[],
) {
  const obsoleteId = getObsoleteDiscountCategoryId(categories);
  const onSale = isSaleCatalogFilter(filters.categoryId, obsoleteId);

  return {
    onSale,
    categoryId: onSale ? undefined : (filters.categoryId ?? undefined),
    urlCategoryId: onSale ? SALE_CATALOG_FILTER_VALUE : filters.categoryId,
    needsSaleUrlCanonicalization:
      onSale && filters.categoryId !== SALE_CATALOG_FILTER_VALUE,
  };
}
