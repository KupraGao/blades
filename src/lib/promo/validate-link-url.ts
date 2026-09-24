import { PROMO_BANNER_INVALID_LINK } from "@/lib/promo/constants";

const MAX_LINK_LENGTH = 500;

export function isInternalAppPath(value: string): boolean {
  if (!value || value.length > MAX_LINK_LENGTH) {
    return false;
  }

  if (!value.startsWith("/")) {
    return false;
  }

  if (value.startsWith("//")) {
    return false;
  }

  if (value.includes("\\") || value.includes("://") || /\s/.test(value)) {
    return false;
  }

  try {
    const url = new URL(value, "https://blades.invalid");

    if (url.origin !== "https://blades.invalid") {
      return false;
    }

    if (url.username || url.password) {
      return false;
    }

    if (url.protocol !== "https:") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function parsePromoLinkUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  if (!isInternalAppPath(trimmed)) {
    throw new Error(PROMO_BANNER_INVALID_LINK);
  }

  return trimmed;
}
