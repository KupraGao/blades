"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROMO_BANNER_IMAGE_REQUIRED } from "@/lib/promo/constants";
import { parsePromoBannerForm } from "@/lib/promo/parse-promo-banner-form";
import {
  getNextPromoSortOrder,
  reindexPromoBannerSortOrder,
} from "@/lib/promo/sort-order";
import {
  removePromoBannerImage,
  uploadPromoBannerImage,
} from "@/lib/promo/promo-banner-storage";

export async function createPromoBanner(formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();
  const input = parsePromoBannerForm(formData);

  if (!input.image) {
    throw new Error(PROMO_BANNER_IMAGE_REQUIRED);
  }

  const imagePath = await uploadPromoBannerImage(supabase, input.image);
  const sortOrder = await getNextPromoSortOrder(supabase);

  const { error } = await supabase.from("promo_banners").insert({
    image_path: imagePath,
    title_ka: input.title_ka,
    title_en: input.title_en,
    subtitle_ka: input.subtitle_ka,
    subtitle_en: input.subtitle_en,
    link_url: input.link_url,
    is_active: input.is_active,
    sort_order: sortOrder,
  });

  if (error) {
    console.log("CREATE PROMO BANNER ERROR:", error);

    try {
      await removePromoBannerImage(supabase, imagePath);
    } catch (cleanupError) {
      console.log("PROMO BANNER ORPHAN CLEANUP ERROR:", cleanupError);
    }

    throw new Error("promoBannerSaveFailed");
  }

  try {
    await reindexPromoBannerSortOrder(supabase);
  } catch (reindexError) {
    console.log("PROMO CREATE REINDEX ERROR:", reindexError);
  }

  revalidatePath("/");
  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}
