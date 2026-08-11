import { SupabaseClient } from "@supabase/supabase-js";

import { orderError } from "@/lib/i18n/localize-storefront-message";
import { ResolvedOrderItem } from "./validate-order";

// =================================================
// INSERT ORDER ITEMS
// =================================================

export async function insertOrderItems(
  supabase: SupabaseClient,
  orderId: string,
  items: ResolvedOrderItem[],
) {
  // =================================================
  // ITEMS
  // =================================================

  const orderItems = items.map((item) => ({
    order_id: orderId,

    product_id: item.productId,

    product_title: item.title,

    product_price: item.price,

    quantity: item.quantity,
  }));

  // =================================================
  // INSERT
  // =================================================

  const { error } = await supabase
    .from("order_items")
    .insert(orderItems);

  // =================================================
  // ERROR
  // =================================================

  if (error) {
    throw orderError("orderErrorSaveOrderItems");
  }
}
