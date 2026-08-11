import { SupabaseClient } from "@supabase/supabase-js";

import { orderError } from "@/lib/i18n/localize-storefront-message";

// =================================================
// DELETE ORDER
// =================================================

export async function deleteOrder(
  supabase: SupabaseClient,
  orderId: string,
) {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    throw orderError("orderErrorCleanupOrder");
  }
}

// =================================================
// DELETE ORDER ITEMS
// =================================================

export async function deleteOrderItems(
  supabase: SupabaseClient,
  orderId: string,
) {
  const { error } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (error) {
    throw orderError("orderErrorCleanupItems");
  }
}

// =================================================
// DELETE ORDER WITH ITEMS (BEST-EFFORT COMPENSATION)
// =================================================

export async function deleteOrderWithItems(
  supabase: SupabaseClient,
  orderId: string,
) {
  await deleteOrderItems(supabase, orderId);
  await deleteOrder(supabase, orderId);
}
