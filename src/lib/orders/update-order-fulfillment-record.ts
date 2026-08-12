import { SupabaseClient } from "@supabase/supabase-js";

import type { FulfillmentMethod } from "./validate-order";

// =================================================
// UPDATE ORDER FULFILLMENT RECORD
// =================================================

type UpdateOrderFulfillmentRecordParams = {
  orderId: string;
  expectedStatus: string;
  expectedFulfillment: FulfillmentMethod;
  nextFulfillment: FulfillmentMethod;
  customerAddress: string | null;
};

export async function updateOrderFulfillmentRecord(
  supabase: SupabaseClient,
  {
    orderId,
    expectedStatus,
    expectedFulfillment,
    nextFulfillment,
    customerAddress,
  }: UpdateOrderFulfillmentRecordParams,
) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      fulfillment_method: nextFulfillment,
      customer_address: customerAddress,
    })
    .eq("id", orderId)
    .eq("status", expectedStatus)
    .eq("fulfillment_method", expectedFulfillment)
    .select("id, status, fulfillment_method, customer_address")
    .maybeSingle();

  if (error) {
    console.error("=== SUPABASE ORDER FULFILLMENT UPDATE ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
    throw new Error("Unable to update order fulfillment.");
  }

  return data as {
    id: string;
    status: string;
    fulfillment_method: string;
    customer_address: string | null;
  } | null;
}
