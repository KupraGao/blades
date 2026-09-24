import { PROMO_BANNERS_BUCKET } from "@/lib/promo/constants";

export function promoBannerPublicUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  if (!base || !imagePath) {
    return "";
  }

  const encoded = imagePath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${base}/storage/v1/object/public/${PROMO_BANNERS_BUCKET}/${encoded}`;
}
