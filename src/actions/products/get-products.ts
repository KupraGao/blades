"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProducts(
  categoryId?: string
) {

  // ======================================
  // SUPABASE
  // ======================================

  const supabase =
    await createClient();

  // ======================================
  // BASE QUERY
  // ======================================

  let query = supabase
    .from("products")
    .select(`
      *,
      product_images (
        id,
        image_url,
        is_main
      ),
      product_categories (
        category_id
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  // ======================================
  // CATEGORY FILTER
  // ======================================

  if (categoryId) {

    query = query.eq(
      "product_categories.category_id",
      categoryId
    );

  }

  // ======================================
  // EXECUTE QUERY
  // ======================================

  const {
    data,
    error,
  } = await query;

  // ======================================
  // ERROR
  // ======================================

  if (error) {

    console.log(
      "PRODUCTS FETCH ERROR:",
      error.message
    );

    return [];

  }

  // ======================================
  // SUCCESS
  // ======================================

  return data;

}