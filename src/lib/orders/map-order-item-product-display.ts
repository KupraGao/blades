import { confirmedVariantWidthsFromMetadata } from "@/lib/products/product-image-delivery";

type ProductImageRow = {
  image_url?: string | null;
  is_main?: boolean | null;
  variant_widths?: unknown;
};

export type OrderItemProductDisplay = {
  product_title: string;
  quantity: number;
  product_price?: number;
  id?: string;
  image_url: string | null;
  variant_widths: number[];
  product_href: string | null;
};

export function resolveMainImageUrl(
  images: ProductImageRow[] | null | undefined,
): string | null {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const main = images.find((image) => image.is_main) ?? images[0];
  const url = typeof main?.image_url === "string" ? main.image_url.trim() : "";

  return url || null;
}

export function resolveLiveProduct(
  productRelation: unknown,
): { id: string; image_url: string | null; variant_widths: number[] } | null {
  const product = Array.isArray(productRelation)
    ? productRelation[0]
    : productRelation;

  if (!product || typeof product !== "object") {
    return null;
  }

  const id =
    typeof (product as { id?: unknown }).id === "string"
      ? (product as { id: string }).id.trim()
      : "";

  if (!id) {
    return null;
  }

  const images = (product as { product_images?: ProductImageRow[] | null }).product_images;
  const main = Array.isArray(images)
    ? (images.find((image) => image.is_main) ?? images[0])
    : undefined;

  return {
    id,
    image_url: resolveMainImageUrl(images),
    variant_widths: confirmedVariantWidthsFromMetadata(main?.variant_widths),
  };
}

export function mapOrderItemProductDisplay(item: any): {
  product_title: string;
  quantity: number;
  product_price: number;
  id: string | undefined;
  image_url: string | null;
  variant_widths: number[];
  product_href: string | null;
} {
  const live = resolveLiveProduct(item?.products);

  return {
    product_title: String(item?.product_title ?? ""),
    quantity: Number(item?.quantity) || 0,
    product_price: Number(item?.product_price) || 0,
    id: typeof item?.id === "string" ? item.id : undefined,
    image_url: live?.image_url ?? null,
    variant_widths: live?.variant_widths ?? [],
    product_href: live ? `/products/${live.id}` : null,
  };
}
