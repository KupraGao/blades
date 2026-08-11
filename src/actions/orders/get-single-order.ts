"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// GET SINGLE ORDER
// =================================================

export async function getSingleOrder(id: string) {
  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // QUERY
  // =================================================

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        product_id,
        product_title,
        product_price,
        quantity
      )
    `)
    .eq("id", id)
    .single();

  // =================================================
  // NOT FOUND
  // =================================================

  if (error) {
    return null;
  }

  // =================================================
  // RESULT
  // =================================================

  return data;
}
