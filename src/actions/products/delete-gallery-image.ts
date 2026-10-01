"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteGalleryImageRecord } from "@/lib/products/delete-gallery-image-record";

export async function deleteGalleryImage(
  imageId: string
) {
  await requireAdmin();

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // DELETE GALLERY IMAGE
  // =================================================

  const { productId } = await deleteGalleryImageRecord(
    supabase,
    imageId
  );

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/edit/${productId}`);
  revalidatePath(`/products/${productId}`);

}