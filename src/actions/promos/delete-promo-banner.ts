"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { removePromoBannerImage } from "@/lib/promo/promo-banner-storage";
import { reindexPromoBannerSortOrder } from "@/lib/promo/sort-order";

export async function deletePromoBanner(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim();

  if (!id) {
    throw new Error("promoBannerNotFound");
  }

  const supabase = createAdminClient();

  const { data: existing, error: loadError } = await supabase
    .from("promo_banners")
    .select("id, image_path")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    console.log("DELETE PROMO BANNER LOAD ERROR:", loadError);
    throw new Error("promoBannersLoadFailed");
  }

  if (!existing) {
    throw new Error("promoBannerNotFound");
  }

  const { error } = await supabase.from("promo_banners").delete().eq("id", id);

  if (error) {
    console.log("DELETE PROMO BANNER ERROR:", error);
    throw new Error("promoBannerDeleteFailed");
  }

  try {
    await reindexPromoBannerSortOrder(supabase);
  } catch (reindexError) {
    console.log("PROMO DELETE REINDEX ERROR:", reindexError);
  }

  if (existing.image_path) {
    try {
      await removePromoBannerImage(supabase, existing.image_path);
    } catch (cleanupError) {
      console.log("PROMO BANNER STORAGE CLEANUP ERROR:", cleanupError);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/promos");
}
