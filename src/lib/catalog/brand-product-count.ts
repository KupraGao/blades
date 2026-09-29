type BrandProductCountDictionary = {
  brandProductCountOne: string;
  brandProductCountMany: string;
};

/**
 * Numeric product counts for Brands UI.
 * KA: always "{count} პროდუქტი" (never პროდუქტები after a number).
 * EN: 1 → product; otherwise products.
 */
export function formatBrandProductCount(
  count: number,
  language: "ka" | "en",
  t: BrandProductCountDictionary,
): string {
  const safeCount = Number.isFinite(count) && count >= 0 ? count : 0;
  const template =
    language === "en" && safeCount === 1
      ? t.brandProductCountOne
      : language === "en"
        ? t.brandProductCountMany
        : t.brandProductCountOne;

  return template.replace("{count}", String(safeCount));
}

type CatalogProductsFoundDictionary = {
  catalogProductsFoundOne: string;
  catalogProductsFoundMany: string;
};

/** Compact catalog result count. KA: always catalogProductsFoundOne. EN: singular/plural. */
export function formatCatalogProductsFound(
  count: number,
  language: "ka" | "en",
  t: CatalogProductsFoundDictionary,
): string {
  const safeCount = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
  const template =
    language === "en" && safeCount === 1
      ? t.catalogProductsFoundOne
      : language === "en"
        ? t.catalogProductsFoundMany
        : t.catalogProductsFoundOne;

  return template.replace("{count}", String(safeCount));
}
