"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePromoBannerForm } from "@/lib/promo/parse-promo-banner-form";
import {
  removePromoBannerImage,
  uploadPromoBannerImage,
} from "@/lib/promo/promo-banner-storage";

export async function updatePromoBanner(id: string, formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();
  const input = parsePromoBannerForm(formData);

  const { data: existing, error: loadError } = await supabase
    .from("promo_banners")
    .select("id, image_path")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    console.log("UPDATE PROMO BANNER LOAD ERROR:", loadError);
    throw new Error("promoBannersLoadFailed");
  }

  if (!existing) {
    throw new Error("promoBannerNotFound");
  }

  let nextImagePath: string | null = null;

  if (input.image) {
    nextImagePath = await uploadPromoBannerImage(supabase, input.image);
  }

  const { error } = await supabase
    .from("promo_banners")
    .update({
      title_ka: input.title_ka,
      title_en: input.title_en,
      subtitle_ka: input.subtitle_ka,
      subtitle_en: input.subtitle_en,
      link_url: input.link_url,
      is_active: input.is_active,
      ...(nextImagePath ? { image_path: nextImagePath } : {}),
    })
    .eq("id", id);

  if (error) {
    console.log("UPDATE PROMO BANNER ERROR:", error);

    if (nextImagePath) {
      try {
        await removePromoBannerImage(supabase, nextImagePath);
      } catch (cleanupError) {
        console.log("PROMO BANNER ORPHAN CLEANUP ERROR:", cleanupError);
      }
    }

    throw new Error("promoBannerSaveFailed");
  }

  if (nextImagePath && existing.image_path && existing.image_path !== nextImagePath) {
    try {
      await removePromoBannerImage(supabase, existing.image_path);
    } catch (cleanupError) {
      console.log("PROMO BANNER OLD IMAGE CLEANUP ERROR:", cleanupError);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/promos");
  revalidatePath(`/admin/promos/edit/${id}`);
  redirect("/admin/promos");
}
