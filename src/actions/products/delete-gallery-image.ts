"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { deleteGalleryImageRecord } from "@/lib/products/delete-gallery-image-record";

export async function deleteGalleryImage(
  imageId: string
) {

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = await createClient();

  // =================================================
  // DELETE GALLERY IMAGE
  // =================================================

  await deleteGalleryImageRecord(
    supabase,
    imageId
  );

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");

}