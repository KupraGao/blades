import { getBrandBySlug } from "@/actions/brands/get-brand-by-slug";

export async function resolveCatalogBrandQuery(brandSlug: string | null): Promise<{
  brandId?: string;
  unknownBrand: boolean;
} | null> {
  if (!brandSlug) {
    return { brandId: undefined, unknownBrand: false };
  }

  const result = await getBrandBySlug(brandSlug);
  if (result.status === "unavailable") return null;

  if (result.status === "missing") {
    return { brandId: undefined, unknownBrand: true };
  }

  return { brandId: String(result.brand.id), unknownBrand: false };
}
