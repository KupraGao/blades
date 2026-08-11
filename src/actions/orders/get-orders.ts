"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// GET ORDERS
// =================================================

export async function getOrders() {
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
    .order("created_at", {
      ascending: false,
    });

  // =================================================
  // ERROR
  // =================================================

  if (error) {
    throw new Error(error.message);
  }

  // =================================================
  // RESULT
  // =================================================

  return data;
}
