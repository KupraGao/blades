import { SupabaseClient } from "@supabase/supabase-js";

export async function insertMainImage(
  supabase: SupabaseClient,
  productId: number,
  publicUrl: string
) {

  const {
    error: imageInsertError,
  } = await supabase
    .from("product_images")
    .insert([
      {
        product_id: productId,
        image_url: publicUrl,
        is_main: true,
      },
    ]);

  if (imageInsertError) {

    console.log(
      "IMAGE INSERT ERROR:",
      imageInsertError
    );

    throw imageInsertError;

  }

}