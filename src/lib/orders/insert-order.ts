import { SupabaseClient } from "@supabase/supabase-js";

// =================================================
// INSERT ORDER
// =================================================

export async function insertOrder(
  supabase: SupabaseClient,
  order: {
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    customer_address: string;
    customer_note: string | null;
    total_price: number;
    status: string;
  }
) {
  // =================================================
  // INSERT
  // =================================================

  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select("id")
    .single();

  // =================================================
  // ERROR
  // =================================================

  if (error) {
    throw new Error(error.message);
  }

  // =================================================
  // RESULT
  // =================================================

  return data.id;
}