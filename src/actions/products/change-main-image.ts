"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { changeMainImageRecord } from "@/lib/products/change-main-image-record";
import { applyMainImageSortOrder } from "@/lib/products/product-image-order";

export async function changeMainImage(
  productId: string,
  imageId: string
) {
  await requireAdmin();

  // =================================================
  // VALIDATION
  // =================================================

  if (!productId || !imageId) {
    throw new Error("Product ID ან Image ID ვერ მოიძებნა.");
  }

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // CHANGE MAIN IMAGE
  // =================================================

  await changeMainImageRecord(
    supabase,
    productId,
    imageId
  );

  await applyMainImageSortOrder(
    supabase,
    productId,
    imageId
  );

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/edit/${productId}`);
  revalidatePath(`/products/${productId}`);

}