"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProducts() {

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        id,
        image_url,
        is_main
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {

    console.log(
      "PRODUCTS FETCH ERROR:",
      error.message
    );

    return [];

  }

  return data;

}