"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { promoBannerPublicUrl } from "@/lib/promo/public-url";
import type { AdminPromoBanner, PromoBannerRow } from "@/lib/promo/types";

function toAdminBanner(row: PromoBannerRow): AdminPromoBanner {
  return {
    ...row,
    imageUrl: promoBannerPublicUrl(row.image_path),
  };
}

export async function getAdminPromoBanners(): Promise<AdminPromoBanner[]> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("promo_banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.log("ADMIN PROMO BANNERS FETCH ERROR:", error);
    throw new Error("promoBannersLoadFailed");
  }

  return ((data ?? []) as PromoBannerRow[]).map(toAdminBanner);
}

export async function getAdminPromoBanner(
  id: string,
): Promise<AdminPromoBanner | null> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("promo_banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.log("ADMIN PROMO BANNER FETCH ERROR:", error);
    throw new Error("promoBannersLoadFailed");
  }

  if (!data) {
    return null;
  }

  return toAdminBanner(data as PromoBannerRow);
}
