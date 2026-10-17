import type { SupabaseClient } from "@supabase/supabase-js";

import { PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES } from "@/lib/products/optimize-product-image";

export const BRAND_LOGOS_BUCKET = "brand-logos";

export const BRAND_LOGO_UPLOAD_FAILED = "BRAND_LOGO_UPLOAD_FAILED";
export const BRAND_LOGO_TOO_LARGE = "BRAND_LOGO_TOO_LARGE";
export const BRAND_LOGO_UNSUPPORTED = "BRAND_LOGO_UNSUPPORTED";

const WEBP_MIME = "image/webp";

function supabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function publicObjectPrefix(): string {
  return `/storage/v1/object/public/${BRAND_LOGOS_BUCKET}/`;
}

export function isStoredBrandLogo(
  logo: string | null | undefined,
): logo is string {
  if (typeof logo !== "string") {
    return false;
  }

  const trimmed = logo.trim();
  const origin = supabaseOrigin();

  if (!trimmed || !origin) {
    return false;
  }

  try {
    const url = new URL(trimmed);

    if (url.origin !== origin) {
      return false;
    }

    const prefix = publicObjectPrefix();

    if (!url.pathname.startsWith(prefix)) {
      return false;
    }

    const objectName = decodeURIComponent(url.pathname.slice(prefix.length));

    return isSafeObjectName(objectName);
  } catch {
    return false;
  }
}

export function storedBrandLogoObjectName(logo: string): string | null {
  if (!isStoredBrandLogo(logo)) {
    return null;
  }

  const prefix = publicObjectPrefix();
  const objectName = decodeURIComponent(new URL(logo.trim()).pathname.slice(prefix.length));

  return isSafeObjectName(objectName) ? objectName : null;
}

function isSafeObjectName(objectName: string): boolean {
  return (
    objectName.length > 0 &&
    !objectName.includes("/") &&
    !objectName.includes("\\") &&
    !objectName.includes("..")
  );
}

export function readOptionalBrandLogo(formData: FormData): File | null {
  const value = formData.get("logo");

  if (!(value instanceof File) || value.size <= 0) {
    return null;
  }

  return value;
}

export async function assertBrandLogoFile(file: File): Promise<void> {
  if (file.size <= 0) {
    throw new Error(BRAND_LOGO_UNSUPPORTED);
  }

  if (file.size > PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES) {
    throw new Error(BRAND_LOGO_TOO_LARGE);
  }

  if (file.type && file.type !== WEBP_MIME) {
    throw new Error(BRAND_LOGO_UNSUPPORTED);
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const riff = String.fromCharCode(...header.slice(0, 4));
  const webp = String.fromCharCode(...header.slice(8, 12));

  if (header.length < 12 || riff !== "RIFF" || webp !== "WEBP") {
    throw new Error(BRAND_LOGO_UNSUPPORTED);
  }
}

export async function uploadBrandLogo(
  supabase: SupabaseClient,
  file: File,
): Promise<string> {
  await assertBrandLogoFile(file);

  const fileName = `${crypto.randomUUID()}-brand-logo.webp`;
  const { error } = await supabase.storage
    .from(BRAND_LOGOS_BUCKET)
    .upload(fileName, file, {
      contentType: WEBP_MIME,
      upsert: false,
    });

  if (error) {
    console.log("BRAND LOGO UPLOAD ERROR:", error);
    throw new Error(BRAND_LOGO_UPLOAD_FAILED);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BRAND_LOGOS_BUCKET).getPublicUrl(fileName);

  return publicUrl;
}

export async function removeStoredBrandLogo(
  supabase: SupabaseClient,
  logo: string | null,
): Promise<void> {
  const objectName = logo ? storedBrandLogoObjectName(logo) : null;

  if (!objectName) {
    return;
  }

  const { error } = await supabase.storage
    .from(BRAND_LOGOS_BUCKET)
    .remove([objectName]);

  if (error) {
    console.log("BRAND LOGO DELETE ERROR:", error);
    throw new Error(error.message);
  }
}
