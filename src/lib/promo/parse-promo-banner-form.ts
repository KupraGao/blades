import {
  PROMO_BANNER_SUBTITLE_MAX,
  PROMO_BANNER_TITLE_MAX,
} from "@/lib/promo/constants";
import { isPromoBannerImageFile } from "@/lib/promo/promo-banner-storage";
import { parsePromoLinkUrl } from "@/lib/promo/validate-link-url";

export type PromoBannerFormInput = {
  title_ka: string | null;
  title_en: string | null;
  subtitle_ka: string | null;
  subtitle_en: string | null;
  link_url: string | null;
  is_active: boolean;
  image: File | null;
};

function optionalText(
  raw: FormDataEntryValue | null,
  max: number,
): string | null {
  const value = raw?.toString().trim() ?? "";

  if (!value) {
    return null;
  }

  return value.slice(0, max);
}

export function parsePromoBannerForm(formData: FormData): PromoBannerFormInput {
  const imageValue = formData.get("image");

  return {
    title_ka: optionalText(formData.get("title_ka"), PROMO_BANNER_TITLE_MAX),
    title_en: optionalText(formData.get("title_en"), PROMO_BANNER_TITLE_MAX),
    subtitle_ka: optionalText(
      formData.get("subtitle_ka"),
      PROMO_BANNER_SUBTITLE_MAX,
    ),
    subtitle_en: optionalText(
      formData.get("subtitle_en"),
      PROMO_BANNER_SUBTITLE_MAX,
    ),
    link_url: parsePromoLinkUrl(formData.get("link_url")?.toString()),
    is_active: formData.get("is_active") === "true",
    image: isPromoBannerImageFile(imageValue) ? imageValue : null,
  };
}
