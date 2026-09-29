import { getBrandBySlug } from "@/actions/brands/get-brand-by-slug";

export async function resolveCatalogBrandQuery(brandSlug: string | null): Promise<{
  brandId?: string;
  unknownBrand: boolean;
}> {
  if (!brandSlug) {
    return { brandId: undefined, unknownBrand: false };
  }

  const brand = await getBrandBySlug(brandSlug);

  if (!brand) {
    return { brandId: undefined, unknownBrand: true };
  }

  return { brandId: String(brand.id), unknownBrand: false };
}
