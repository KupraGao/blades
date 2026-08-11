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
    throw new Error("შეკვეთის შენახვა ვერ მოხერხდა.");
  }

  // =================================================
  // RESULT
  // =================================================

  return data.id as string;
}
