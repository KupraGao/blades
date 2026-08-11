import { SupabaseClient } from "@supabase/supabase-js";

import { OrderStatus } from "./order-status";

// =================================================
// UPDATE ORDER STATUS RECORD
// =================================================

type UpdateOrderStatusRecordParams = {
  orderId: string;
  expectedStatus: string;
  nextStatus: OrderStatus;
};

export async function updateOrderStatusRecord(
  supabase: SupabaseClient,
  {
    orderId,
    expectedStatus,
    nextStatus,
  }: UpdateOrderStatusRecordParams,
) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: nextStatus,
    })
    .eq("id", orderId)
    .eq("status", expectedStatus)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("=== SUPABASE ORDER STATUS UPDATE ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
    throw new Error("შეკვეთის სტატუსის განახლება ვერ მოხერხდა.");
  }

  return data as { id: string; status: string } | null;
}
