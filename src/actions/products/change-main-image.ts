"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { changeMainImageRecord } from "@/lib/products/change-main-image-record";

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

  const supabase = await createClient();

  // =================================================
  // CHANGE MAIN IMAGE
  // =================================================

  await changeMainImageRecord(
    supabase,
    productId,
    imageId
  );

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/edit/${productId}`);

}