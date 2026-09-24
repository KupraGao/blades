"use server";

import { createClient } from "@/lib/supabase/server";
import { promoBannerPublicUrl } from "@/lib/promo/public-url";
import type { StorefrontPromoBanner } from "@/lib/promo/types";

export async function getActivePromoBanners(): Promise<StorefrontPromoBanner[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promo_banners")
      .select("id, image_path, title_ka, title_en, subtitle_ka, subtitle_en, link_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.log("PROMO BANNERS FETCH ERROR:", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      imageUrl: promoBannerPublicUrl(row.image_path),
      title_ka: row.title_ka ?? null,
      title_en: row.title_en ?? null,
      subtitle_ka: row.subtitle_ka ?? null,
      subtitle_en: row.subtitle_en ?? null,
      link_url: row.link_url ?? null,
    }));
  } catch (error) {
    console.log("PROMO BANNERS FETCH ERROR:", error);
    return [];
  }
}
