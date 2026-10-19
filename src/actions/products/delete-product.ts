"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  cleanupStoredProductImages,
  loadProductImageRefs,
  removeProductImageObject,
} from "@/lib/products/product-image-storage-cleanup";
import { clearStoredVariantWidths } from "@/lib/products/product-image-variant-metadata";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteProduct(formData:FormData){
  await requireAdmin();

  // =================================================
  // SUPABASE
  // =================================================

  const supabase=createAdminClient();

  // =================================================
  // PRODUCT ID
  // =================================================

  const productId=formData.get("id") as string;

  // =================================================
  // STORAGE, THEN THE EXISTING PRODUCT DELETE
  // =================================================

  await cleanupStoredProductImages({
    authorization: { admin: true },
    productIds: typeof productId === "string" && productId.length > 0 ? [productId] : [],
    loadImages: () => loadProductImageRefs(supabase),
    clearVariantWidths: (imageIds) => clearStoredVariantWidths(supabase, imageIds),
    removeExact: (fileName) => removeProductImageObject(supabase, fileName),
    deleteDatabase: async () => {
      const{error}=await supabase
        .from("products")
        .delete()
        .eq("id",productId);

      if(error){
        console.log("DELETE ERROR:",error);
      }

      return { error: error ? { message: error.message } : null };
    },
  });

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");

}