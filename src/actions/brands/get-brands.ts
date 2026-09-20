"use server";

import { createClient } from "@/lib/supabase/server";

export type StorefrontBrand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
};

function normalizeProductCount(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return Math.floor(raw);
  }

  if (Array.isArray(raw) && raw[0] && typeof raw[0] === "object") {
    const count = (raw[0] as { count?: unknown }).count;
    if (typeof count === "number" && Number.isFinite(count) && count >= 0) {
      return Math.floor(count);
    }
  }

  if (raw && typeof raw === "object" && "count" in raw) {
    const count = (raw as { count?: unknown }).count;
    if (typeof count === "number" && Number.isFinite(count) && count >= 0) {
      return Math.floor(count);
    }
  }

  return 0;
}

/** Admin / form select — all brands, no product counts. */
export async function getBrands() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  if (error) {
    console.log("BRANDS ERROR:", error);
    return [];
  }

  return data;
}

/**
 * Storefront Brands directory — one query with nested product counts.
 * Includes zero-product brands.
 */
export async function getStorefrontBrands(): Promise<StorefrontBrand[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select(
      `
      id,
      name,
      slug,
      logo,
      products(count)
    `,
    )
    .order("name");

  if (error) {
    console.log("STOREFRONT BRANDS ERROR:", error);
    return [];
  }

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo ?? null,
    productCount: normalizeProductCount(row.products),
  }));
}
