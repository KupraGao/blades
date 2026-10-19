import { PRODUCT_IMAGE_VARIANT_WIDTHS } from "@/lib/products/product-image-dimensions";
import {
  masterFileNameFromImageUrl,
  PRODUCT_IMAGES_BUCKET,
  variantFileNameFromMaster,
} from "@/lib/products/product-image-variant-storage";

export type ProductImageDelivery = {
  src: string;
  srcSet?: string;
};

/**
 * Master რჩება src-ად.
 * srcset იწერება მხოლოდ გადმოცემული დადასტურებული სიგანეებისთვის.
 */
export function confirmedVariantWidthsFromMetadata(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const widths: number[] = [];
  const seen = new Set<number>();

  for (const item of value) {
    if (typeof item !== "number" || !isConfirmedVariantWidth(item) || seen.has(item)) {
      continue;
    }

    seen.add(item);
    widths.push(item);
  }

  widths.sort((left, right) => left - right);
  return widths;
}

export function productImageDelivery(
  masterUrl: string,
  confirmedWidths: readonly number[] | null | undefined,
  options?: { zoom?: boolean },
): ProductImageDelivery {
  const widths = confirmedVariantWidthsFromMetadata(confirmedWidths);

  if (options?.zoom || widths.length === 0) {
    return { src: masterUrl };
  }

  const candidates: { width: number; url: string }[] = [];
  const seen = new Set<number>();

  for (const width of widths) {
    if (!isConfirmedVariantWidth(width) || seen.has(width)) {
      continue;
    }

    const url = variantUrlFromMasterUrl(masterUrl, width);

    if (!url || url === masterUrl) {
      continue;
    }

    seen.add(width);
    candidates.push({ width, url });
  }

  if (candidates.length === 0) {
    return { src: masterUrl };
  }

  candidates.sort((left, right) => left.width - right.width);

  return {
    src: masterUrl,
    srcSet: candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", "),
  };
}

export function variantUrlFromMasterUrl(masterUrl: string, width: number): string | null {
  if (!isConfirmedVariantWidth(width)) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(masterUrl);
  } catch {
    return null;
  }

  const masterFileName = masterFileNameFromImageUrl(url.toString());
  const variantFileName = masterFileName
    ? variantFileNameFromMaster(masterFileName, width)
    : null;

  if (!masterFileName || !variantFileName || variantFileName === masterFileName) {
    return null;
  }

  const parts = url.pathname.split("/");
  const bucketIndex = parts.lastIndexOf(PRODUCT_IMAGES_BUCKET);

  if (bucketIndex === -1 || bucketIndex !== parts.length - 2) {
    return null;
  }

  let currentName: string;

  try {
    currentName = decodeURIComponent(parts[bucketIndex + 1] ?? "");
  } catch {
    return null;
  }

  if (currentName !== masterFileName) {
    return null;
  }

  parts[bucketIndex + 1] = variantFileName;
  url.pathname = parts.join("/");
  url.search = "";
  url.hash = "";

  return url.toString();
}

function isConfirmedVariantWidth(
  width: number,
): width is (typeof PRODUCT_IMAGE_VARIANT_WIDTHS)[number] {
  return PRODUCT_IMAGE_VARIANT_WIDTHS.some((candidate) => candidate === width);
}
