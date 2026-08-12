import { SupabaseClient } from "@supabase/supabase-js";

import { orderError } from "@/lib/i18n/localize-storefront-message";

// =================================================
// INSERT ORDER
// =================================================

export async function insertOrder(
  supabase: SupabaseClient,
  order: {
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    customer_address: string | null;
    customer_note: string | null;
    fulfillment_method: "delivery" | "pickup";
    total_price: number;
    status: string;
  },
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
    console.error("=== SUPABASE ORDER INSERT ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
    throw orderError("orderErrorSaveOrder");
  }

  // =================================================
  // RESULT
  // =================================================

  return data.id as string;
}
