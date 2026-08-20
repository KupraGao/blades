import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// LOAD ORDER BY ID (internal privileged read)
// =================================================
// Authorization must happen in the caller.
// Do not export as a public UUID-only capability.
// =================================================

const ORDER_WITH_ITEMS_SELECT = `
  *,
  order_items (
    id,
    product_id,
    product_title,
    product_price,
    quantity
  )
`;

export async function loadOrderById(id: string) {
  const trimmedId = id.trim();

  if (!trimmedId) {
    return null;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq("id", trimmedId)
    .single();

  if (error) {
    console.error("loadOrderById error", {
      code: error.code ?? null,
    });
    return null;
  }

  return data;
}
