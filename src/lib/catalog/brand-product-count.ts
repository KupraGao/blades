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
