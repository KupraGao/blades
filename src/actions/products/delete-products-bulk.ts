"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  cleanupStoredProductImages,
  loadProductImageRefs,
  removeProductImageObject,
} from "@/lib/products/product-image-storage-cleanup";
import { clearStoredVariantWidths } from "@/lib/products/product-image-variant-metadata";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  productIds: string[];
};

export async function deleteProductsBulk({
  productIds,
}: Props) {
  await requireAdmin();

  const supabase = createAdminClient();

  if (productIds.length === 0) {
    return;
  }


  await cleanupStoredProductImages({
    authorization: { admin: true },
    productIds,
    loadImages: () => loadProductImageRefs(supabase),
    clearVariantWidths: (imageIds) => clearStoredVariantWidths(supabase, imageIds),
    removeExact: (fileName) => removeProductImageObject(supabase, fileName),
    deleteDatabase: async () => {
      const { error: categoryError } = await supabase
        .from("product_categories")
        .delete()
        .in("product_id", productIds);

      if (categoryError) {
        return { error: { message: categoryError.message } };
      }

      const { error: imageError } = await supabase
        .from("product_images")
        .delete()
        .in("product_id", productIds);

      if (imageError) {
        return { error: { message: imageError.message } };
      }

      const { error: productError } = await supabase
        .from("products")
        .delete()
        .in("id", productIds);

      if (productError) {
        return { error: { message: productError.message } };
      }

      return { error: null };
    },
  });

}