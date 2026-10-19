import { SupabaseClient } from "@supabase/supabase-js";

import { resequenceProductImages } from "@/lib/products/product-image-order";
import { blockProductImageVariantWrites } from "@/lib/products/product-image-variant-metadata";
import {
  ProductImageVariantCleanupError,
  removeExactProductImageVariants,
  variantObjectNamesFromMasterUrl,
} from "@/lib/products/product-image-variant-storage";

export async function deleteGalleryImageRecord(
  supabase: SupabaseClient,
  imageId: string,
  authorization: { admin: boolean },
): Promise<{ productId: string }> {
  if (authorization.admin !== true) {
    throw new ProductImageVariantCleanupError("UNAUTHORIZED");
  }

  // =================================================
  // GET IMAGE
  // =================================================

  const { data, error } = await supabase
    .from("product_images")
    .select("image_url, product_id")
    .eq("id", imageId)
    .single();

  // =================================================
  // GET IMAGE ERROR
  // =================================================

  if (error) {

    console.error("========== GET IMAGE ERROR ==========");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
    console.error(error);

    throw new Error(error.message);

  }

  // =================================================
  // FILE NAME
  // =================================================

  const fileName = data.image_url.split("/").pop();
  const variantNames = variantObjectNamesFromMasterUrl(data.image_url);

  if (variantNames || fileName) {
    await blockProductImageVariantWrites(supabase, data.product_id, imageId);
  }

  if (variantNames) {
    await removeExactProductImageVariants(
      { admin: true },
      async (variantFileName) => {
        if (!variantNames.includes(variantFileName)) {
          return { error: { message: "Rejected storage name." } };
        }

        const { error: variantError } = await supabase.storage
          .from("product-images")
          .remove([variantFileName]);

        if (variantError) {
          console.error("========== STORAGE DELETE ERROR ==========");
          console.error("MESSAGE:", variantError.message);
          console.error(variantError);

          return { error: { message: variantError.message } };
        }

        return { error: null };
      },
      data.image_url,
    );
  }

  // =================================================
  // DELETE STORAGE FILE
  // =================================================

  if (fileName) {

    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([fileName]);

    if (storageError) {

      console.error("========== STORAGE DELETE ERROR ==========");
      console.error("MESSAGE:", storageError.message);
      console.error(storageError);

      throw new Error(storageError.message);

    }

  }

  // =================================================
  // DELETE IMAGE RECORD
  // =================================================

  const result = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  console.log("========== DELETE RESULT ==========");
  console.log(result);

  const { error: deleteError } = result;

  // =================================================
  // DELETE ERROR
  // =================================================

  if (deleteError) {

    console.error("========== DELETE IMAGE ERROR ==========");
    console.error("CODE:", deleteError.code);
    console.error("MESSAGE:", deleteError.message);
    console.error("DETAILS:", deleteError.details);
    console.error("HINT:", deleteError.hint);
    console.error(deleteError);

    throw new Error(deleteError.message);

  }

  const productId = String(data.product_id);

  await resequenceProductImages(supabase, productId);

  return { productId };

}