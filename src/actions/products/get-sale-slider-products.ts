"use server";

import { createClient } from "@/lib/supabase/server";
import { SALE_PRODUCTS_SLIDER_LIMIT } from "@/lib/catalog/catalog-search-params";

export type SaleSliderProduct = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  product_images: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
};

export async function getSaleSliderProducts(): Promise<SaleSliderProduct[]> {
  const supabase = await createClient();
  const limit = SALE_PRODUCTS_SLIDER_LIMIT;
  const to = Math.max(limit - 1, 0);

  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, sale_price, product_images(id, image_url, is_main)")
    .not("sale_price", "is", null)
    .order("created_at", { ascending: false })
    .range(0, to);

  if (error) {
    console.log("SALE SLIDER PRODUCTS FETCH ERROR:", error);
    return [];
  }

  return (data ?? []) as SaleSliderProduct[];
}
