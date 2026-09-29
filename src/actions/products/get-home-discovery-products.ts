"use server";

import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { HOME_DISCOVERY_LIMIT } from "@/lib/catalog/catalog-search-params";

const PRODUCT_CARD_SELECT = `
  *,
  brands(id,name,slug,logo),
  product_images(id,image_url,is_main),
  product_categories(category_id,categories(id,name_ka,name_en))
`;

const ID_PAGE_SIZE = 1000;

function shuffleUniqueIds(ids: string[]): string[] {
  const unique = [...new Set(ids)];

  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = unique[i]!;
    unique[i] = unique[j]!;
    unique[j] = current;
  }

  return unique;
}

async function fetchAllStorefrontProductIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string[]> {
  const ids: string[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .range(from, from + ID_PAGE_SIZE - 1);

    if (error) {
      console.log("HOME DISCOVERY IDS ERROR:", error);
      return ids;
    }

    if (!data?.length) break;

    for (const row of data) {
      if (row?.id) ids.push(String(row.id));
    }

    if (data.length < ID_PAGE_SIZE) break;
    from += ID_PAGE_SIZE;
  }

  return ids;
}

/**
 * Home discovery: up to 10 unique random storefront products.
 * `connection()` opts this request into dynamic rendering so the shuffle
 * is not frozen by static/ISR cache.
 * Same function is the server action for Recommended Refresh (no second algorithm).
 */
export async function getHomeDiscoveryProducts(
  previousIds?: string[],
): Promise<{ products: any[]; catalogSize: number }> {
  await connection();

  const supabase = await createClient();
  const allIds = await fetchAllStorefrontProductIds(supabase);
  const catalogSize = new Set(allIds).size;

  if (allIds.length === 0) {
    return { products: [], catalogSize: 0 };
  }

  let selectedIds = shuffleUniqueIds(allIds).slice(0, HOME_DISCOVERY_LIMIT);

  const previous = Array.isArray(previousIds)
    ? previousIds.map((id) => String(id))
    : [];

  if (
    catalogSize > HOME_DISCOVERY_LIMIT &&
    previous.length === selectedIds.length &&
    selectedIds.every((id, index) => id === previous[index])
  ) {
    selectedIds = shuffleUniqueIds(allIds).slice(0, HOME_DISCOVERY_LIMIT);
  }

  if (selectedIds.length === 0) {
    return { products: [], catalogSize };
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .in("id", selectedIds);

  if (error) {
    console.log("HOME DISCOVERY PRODUCTS ERROR:", error);
    return { products: [], catalogSize };
  }

  const byId = new Map(
    (data ?? []).map((product) => [String(product.id), product]),
  );

  const products = selectedIds
    .map((id) => byId.get(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return { products, catalogSize };
}
