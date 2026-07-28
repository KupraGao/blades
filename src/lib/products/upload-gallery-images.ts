import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadGalleryImages(
  supabase: SupabaseClient,
  productId: number,
  galleryImages: File[]
) {

  // =================================================
  // GALLERY LOOP
  // =================================================

  for (const image of galleryImages) {

    // =================================================
    // EMPTY FILE SKIP
    // =================================================

    if (!image.name) continue;


    // =================================================
    // FILE NAME
    // =================================================

    const galleryFileName =
      `${Date.now()}-${image.name}`;


    // =================================================
    // IMAGE UPLOAD
    // =================================================

    const {
      error: galleryUploadError,
    } = await supabase.storage
      .from("product-images")
      .upload(
        galleryFileName,
        image
      );


    // =================================================
    // UPLOAD ERROR
    // =================================================

    if (galleryUploadError) {

      console.log(
        "GALLERY ERROR:",
        galleryUploadError
      );

      continue;

    }


    // =================================================
    // PUBLIC URL
    // =================================================

    const {
      data: {
        publicUrl: galleryUrl,
      },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(
        galleryFileName
      );


    // =================================================
    // IMAGE INSERT
    // =================================================

    await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: galleryUrl,
          is_main: false,
        },
      ]);

  }

}