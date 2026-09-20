"use server";

import { createClient } from "@/lib/supabase/server";

export type BrandBySlugResult = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

/**
 * Fail-closed slug resolution for storefront routes.
 * Exactly one match → brand; 0 or >1 → null (caller should notFound()).
 */
export async function getBrandBySlug(
  slug: string,
): Promise<BrandBySlugResult | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo")
    .eq("slug", trimmed);

  if (error) {
    console.log("GET BRAND BY SLUG ERROR:", error);
    return null;
  }

  if (!data || data.length !== 1) {
    return null;
  }

  const brand = data[0];

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo ?? null,
  };
}
