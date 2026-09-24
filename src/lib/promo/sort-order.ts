import type { SupabaseClient } from "@supabase/supabase-js";

const PROMO_ORDER_SELECT = "id, sort_order, created_at";

export async function getNextPromoSortOrder(
  supabase: SupabaseClient,
): Promise<number> {
  const { data, error } = await supabase
    .from("promo_banners")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("PROMO NEXT SORT ORDER ERROR:", error);
    throw new Error("promoBannersLoadFailed");
  }

  if (!data || typeof data.sort_order !== "number") {
    return 1;
  }

  return data.sort_order + 1;
}

export async function reindexPromoBannerSortOrder(
  supabase: SupabaseClient,
): Promise<void> {
  const { data, error } = await supabase
    .from("promo_banners")
    .select(PROMO_ORDER_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.log("PROMO REINDEX LOAD ERROR:", error);
    throw new Error("promoBannersLoadFailed");
  }

  const rows = data ?? [];

  for (let index = 0; index < rows.length; index += 1) {
    const nextOrder = index + 1;
    const row = rows[index];

    if (row.sort_order === nextOrder) {
      continue;
    }

    const { error: updateError } = await supabase
      .from("promo_banners")
      .update({ sort_order: nextOrder })
      .eq("id", row.id);

    if (updateError) {
      console.log("PROMO REINDEX UPDATE ERROR:", updateError);
      throw new Error("promoBannersLoadFailed");
    }
  }
}
