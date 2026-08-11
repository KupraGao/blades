import { SupabaseClient } from "@supabase/supabase-js";

import { orderError } from "@/lib/i18n/localize-storefront-message";
import { ResolvedOrderItem } from "./validate-order";

// =================================================
// DECREMENT PRODUCT STOCK
// =================================================

export async function decrementProductStock(
  supabase: SupabaseClient,
  item: ResolvedOrderItem,
) {
  const nextStock = item.stock - item.quantity;

  if (nextStock < 0) {
    throw orderError("orderErrorInsufficientStock", item.title);
  }

  const { data, error } = await supabase
    .from("products")
    .update({ stock: nextStock })
    .eq("id", item.productId)
    .eq("stock", item.stock)
    .select("id")
    .maybeSingle();

  if (error) {
    throw orderError("orderErrorUpdateStock");
  }

  if (!data) {
    throw orderError("orderErrorStockChanged", item.title);
  }
}

// =================================================
// RESTORE PRODUCT STOCK (COMPENSATION)
// =================================================

export async function restoreProductStock(
  supabase: SupabaseClient,
  item: ResolvedOrderItem,
) {
  const { error } = await supabase
    .from("products")
    .update({ stock: item.stock })
    .eq("id", item.productId);

  if (error) {
    throw orderError("orderErrorRestoreStock");
  }
}

// =================================================
// DECREMENT ALL ORDER STOCK
// =================================================

export async function decrementOrderStock(
  supabase: SupabaseClient,
  items: ResolvedOrderItem[],
) {
  const decremented: ResolvedOrderItem[] = [];

  try {
    for (const item of items) {
      await decrementProductStock(supabase, item);
      decremented.push(item);
    }
  } catch (error) {
    for (const item of decremented.reverse()) {
      try {
        await restoreProductStock(supabase, item);
      } catch {
        // Best-effort compensation only.
      }
    }

    throw error;
  }
}
