"use server";

import { parseCatalogSearchTerm } from "@/lib/catalog/catalog-search-params";
import { productSearchOrFilter } from "@/lib/products/product-search-filter";
import { confirmedVariantWidthsFromMetadata } from "@/lib/products/product-image-delivery";
import {
  PRODUCT_IMAGES_NESTED_ORDER,
  sortProductImages,
} from "@/lib/products/sort-product-images";
import { createClient } from "@/lib/supabase/server";

const STOREFRONT_SEARCH_LIMIT = 6;

export type StorefrontProductSuggestion = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  imageUrl: string | null;
  variantWidths: number[];
};

type SuggestionImage = {
  image_url?: string | null;
  is_main?: boolean | null;
  sort_order?: number | null;
  variant_widths?: unknown;
};

type SuggestionRow = {
  id: string;
  title: string;
  price: number | string;
  sale_price: number | string | null;
  product_images: SuggestionImage[] | null;
};

function suggestionImage(images: SuggestionImage[] | null) {
  const ordered = sortProductImages(images);
  const main = ordered.find((image) => image.is_main) ?? ordered[0];
  const url = typeof main?.image_url === "string" ? main.image_url.trim() : "";

  return {
    imageUrl: url || null,
    variantWidths: confirmedVariantWidthsFromMetadata(main?.variant_widths),
  };
}

function suggestionPrice(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

export async function searchStorefrontProducts(
  raw: string,
): Promise<StorefrontProductSuggestion[]> {
  const term = parseCatalogSearchTerm(raw);
  if (!term) return [];

  const searchFilter = productSearchOrFilter(term);
  if (!searchFilter) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      title,
      price,
      sale_price,
      product_images(id, image_url, is_main, sort_order, variant_widths)
    `,
    )
    .or(searchFilter)
    .order("title", { ascending: true })
    .order("id", { ascending: true })
    .order("sort_order", PRODUCT_IMAGES_NESTED_ORDER)
    .limit(STOREFRONT_SEARCH_LIMIT);

  if (error || !data) {
    console.log("PRODUCT SEARCH ERROR:", error);
    return [];
  }

  return (data as SuggestionRow[]).flatMap((row) => {
    const price = suggestionPrice(row.price);
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!row.id || !title || price === null) return [];

    return [
      {
        id: row.id,
        title,
        price,
        sale_price: suggestionPrice(row.sale_price),
        ...suggestionImage(row.product_images),
      },
    ];
  });
}
