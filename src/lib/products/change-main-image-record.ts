import { SupabaseClient } from "@supabase/supabase-js";

export async function changeMainImageRecord(
  supabase: SupabaseClient,
  productId: string,
  imageId: string
) {

  // =================================================
  // REMOVE CURRENT MAIN IMAGE
  // =================================================

  const { error: resetError } = await supabase
    .from("product_images")
    .update({
      is_main: false,
    })
    .eq("product_id", productId);

  // =================================================
  // RESET ERROR
  // =================================================

  if (resetError) {

    console.error("========== RESET MAIN IMAGE ERROR ==========");
    console.error("CODE:", resetError.code);
    console.error("MESSAGE:", resetError.message);
    console.error("DETAILS:", resetError.details);
    console.error("HINT:", resetError.hint);
    console.error(resetError);

    throw new Error(resetError.message);

  }

  // =================================================
  // SET NEW MAIN IMAGE
  // =================================================

  const { error: updateError } = await supabase
    .from("product_images")
    .update({
      is_main: true,
    })
    .eq("id", imageId);

  // =================================================
  // UPDATE ERROR
  // =================================================

  if (updateError) {

    console.error("========== CHANGE MAIN IMAGE ERROR ==========");
    console.error("CODE:", updateError.code);
    console.error("MESSAGE:", updateError.message);
    console.error("DETAILS:", updateError.details);
    console.error("HINT:", updateError.hint);
    console.error(updateError);

    throw new Error(updateError.message);

  }

}