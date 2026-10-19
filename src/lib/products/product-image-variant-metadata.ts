import type { SupabaseClient } from "@supabase/supabase-js";

import { confirmedVariantWidthsFromMetadata } from "@/lib/products/product-image-delivery";
import {
  ProductImageVariantCleanupError,
  ProductImageVariantUploadError,
  type ProductImageVariantMetadataWriter,
} from "@/lib/products/product-image-variant-storage";

export type { ProductImageVariantMetadataWriter };

export function mergeConfirmedVariantWidth(current: unknown, width: number): number[] | null {
  const merged = confirmedVariantWidthsFromMetadata(
    Array.isArray(current) ? [...current, width] : [width],
  );

  return merged.includes(width) ? merged : null;
}

export function createProductImageVariantMetadataWriter(
  supabase: SupabaseClient,
): ProductImageVariantMetadataWriter {
  return {
    async rememberConfirmedWidth(productId, imageId, width) {
      const { data, error } = await supabase.rpc("append_product_image_variant_width", {
        target_product_id: productId,
        target_image_id: imageId,
        target_width: width,
      });
      const message = error?.message ?? "";

      if (message.includes("writes_blocked")) {
        throw new ProductImageVariantUploadError("WRITES_BLOCKED");
      }

      if (message.includes("image_not_found")) {
        throw new ProductImageVariantUploadError("IMAGE_NOT_FOUND");
      }

      const stored = confirmedVariantWidthsFromMetadata(data);

      if (error || !Array.isArray(data) || !stored.includes(width)) {
        throw new ProductImageVariantUploadError("METADATA_FAILED");
      }
    },
  };
}

export async function blockProductImageVariantWrites(
  supabase: SupabaseClient,
  productId: string | number,
  imageId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("product_images")
    .update({ variant_writes_blocked: true, variant_widths: [] })
    .eq("id", imageId)
    .eq("product_id", productId)
    .select("id");

  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new ProductImageVariantCleanupError("METADATA_FAILED");
  }
}

export async function removeConfirmedVariantWidth(
  supabase: SupabaseClient,
  productId: string,
  imageId: string,
  width: number,
): Promise<void> {
  const { data, error } = await supabase.rpc("remove_product_image_variant_width", {
    target_product_id: productId,
    target_image_id: imageId,
    target_width: width,
  });
  const stored = confirmedVariantWidthsFromMetadata(data);

  if (error || !Array.isArray(data) || stored.includes(width)) {
    throw new ProductImageVariantCleanupError("METADATA_FAILED");
  }
}

export async function clearStoredVariantWidths(
  supabase: SupabaseClient,
  imageIds: readonly string[],
): Promise<{ error: { message: string } | null }> {
  const ids = [...new Set(imageIds.filter((id) => id.length > 0))];

  if (ids.length === 0) {
    return { error: null };
  }

  const { data, error } = await supabase
    .from("product_images")
    .update({ variant_writes_blocked: true, variant_widths: [] })
    .in("id", ids)
    .select("id");

  if (error) {
    return { error: { message: error.message } };
  }

  const updated = new Set((data ?? []).map((row) => String(row.id)));

  if (ids.some((id) => !updated.has(id))) {
    return { error: { message: "METADATA_FAILED" } };
  }

  return { error: null };
}
