"use server";

import { createClient } from "@/lib/supabase/server";

export type BrandBySlugResult = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

type BrandLookup =
  | { status: "found"; brand: BrandBySlugResult }
  | { status: "missing" }
  | { status: "unavailable" };

export async function getBrandBySlug(
  slug: string,
): Promise<BrandLookup> {
  const trimmed = slug.trim();
  if (!trimmed) return { status: "missing" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo")
    .eq("slug", trimmed);

  if (error) {
    console.error("Brand query failed", { code: error.code });
    return { status: "unavailable" };
  }

  if (!data || data.length !== 1) {
    return { status: "missing" };
  }

  const brand = data[0];

  return {
    status: "found",
    brand: {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo ?? null,
    },
  };
}
