import { SupabaseClient } from "@supabase/supabase-js";

import {
  PRODUCT_IMAGE_UPLOAD_FAILED,
  productImageStorageFileName,
} from "@/lib/products/product-image-storage-key";

type UploadGalleryImagesRecordParams = {
  supabase: SupabaseClient;
  productId: string;
  images: File[];
};

export async function uploadGalleryImagesRecord({
  supabase,
  productId,
  images,
}: UploadGalleryImagesRecordParams) {

  // =================================================
  // NO IMAGES
  // =================================================

  if (images.length === 0) {
    return;
  }

  // =================================================
  // UPLOAD GALLERY IMAGES
  // =================================================

  for (const image of images) {

    // =================================================
    // IMAGE NAME
    // =================================================

    const fileName = productImageStorageFileName();

    // =================================================
    // STORAGE UPLOAD
    // =================================================

    const { error: imageError } = await supabase.storage
      .from("product-images")
      .upload(fileName, image);

    if (imageError) {
      console.log("IMAGE ERROR:", imageError);
      throw new Error(PRODUCT_IMAGE_UPLOAD_FAILED);
    }

    // =================================================
    // PUBLIC URL
    // =================================================

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    // =================================================
    // INSERT IMAGE
    // =================================================

    const { error: insertError } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: publicUrl,
          is_main: false,
        },
      ]);

    if (insertError) {
      console.log("IMAGE INSERT ERROR:", insertError);
      throw insertError;
    }

  }

}