import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteGalleryImageRecord(
  supabase: SupabaseClient,
  imageId: string
) {

  // =================================================
  // GET IMAGE
  // =================================================

  const { data, error } = await supabase
    .from("product_images")
    .select("image_url")
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

}