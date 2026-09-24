import type { SupabaseClient } from "@supabase/supabase-js";

import {
  PROMO_BANNER_IMAGE_MAX_BYTES,
  PROMO_BANNER_IMAGE_TOO_LARGE,
  PROMO_BANNER_UNSUPPORTED_IMAGE,
  PROMO_BANNER_UPLOAD_FAILED,
  PROMO_BANNERS_BUCKET,
} from "@/lib/promo/constants";

const ALLOWED_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

export function promoBannerStorageFileName() {
  return `${crypto.randomUUID()}-promo-banner.webp`;
}

export function isPromoBannerImageFile(
  value: FormDataEntryValue | null,
): value is File {
  return value instanceof File && value.size > 0 && Boolean(value.name);
}

export function assertPromoBannerImageFile(file: File) {
  if (file.size > PROMO_BANNER_IMAGE_MAX_BYTES) {
    throw new Error(PROMO_BANNER_IMAGE_TOO_LARGE);
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    throw new Error(PROMO_BANNER_UNSUPPORTED_IMAGE);
  }
}

export async function uploadPromoBannerImage(
  supabase: SupabaseClient,
  file: File,
): Promise<string> {
  assertPromoBannerImageFile(file);

  const fileName = promoBannerStorageFileName();

  const { error } = await supabase.storage
    .from(PROMO_BANNERS_BUCKET)
    .upload(fileName, file, {
      contentType: file.type || "image/webp",
      upsert: false,
    });

  if (error) {
    console.log("PROMO BANNER IMAGE UPLOAD ERROR:", error);
    throw new Error(PROMO_BANNER_UPLOAD_FAILED);
  }

  return fileName;
}

export async function removePromoBannerImage(
  supabase: SupabaseClient,
  imagePath: string,
): Promise<void> {
  if (!imagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(PROMO_BANNERS_BUCKET)
    .remove([imagePath]);

  if (error) {
    console.log("PROMO BANNER STORAGE DELETE ERROR:", error);
    throw new Error(error.message);
  }
}
