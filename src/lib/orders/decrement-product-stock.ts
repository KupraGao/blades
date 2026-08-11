import { SupabaseClient } from "@supabase/supabase-js";

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
    throw new Error(
      `მარაგი არასაკმარისია: ${item.title || "უცნობი პროდუქტი"}.`,
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update({ stock: nextStock })
    .eq("id", item.productId)
    .eq("stock", item.stock)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("მარაგის განახლება ვერ მოხერხდა.");
  }

  if (!data) {
    throw new Error(
      `მარაგი შეიცვალა ან არასაკმარისია: ${item.title || "უცნობი პროდუქტი"}.`,
    );
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
    throw new Error("მარაგის აღდგენა ვერ მოხერხდა.");
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
