import { SupabaseClient } from "@supabase/supabase-js";

import {
  PRODUCT_IMAGE_UPLOAD_FAILED,
  productImageStorageFileName,
} from "@/lib/products/product-image-storage-key";
import { getNextGallerySortOrder } from "@/lib/products/product-image-order";

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

  const saved: { id: string; imageUrl: string }[] = [];

  if (images.length === 0) {
    return saved;
  }

  // =================================================
  // NEXT SORT ORDER
  // Append after the current highest sort_order. Do not reset existing rows.
  // =================================================

  let sortOrder = await getNextGallerySortOrder(supabase, productId);

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

    const { data, error: insertError } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: publicUrl,
          is_main: false,
          sort_order: sortOrder,
        },
      ])
      .select("id, image_url")
      .single();

    if (insertError) {
      console.log("IMAGE INSERT ERROR:", insertError);
      throw insertError;
    }

    if (!data?.id || !data.image_url) {
      throw new Error("IMAGE INSERT ERROR");
    }

    saved.push({
      id: String(data.id),
      imageUrl: data.image_url,
    });

    sortOrder += 1;

  }

  return saved;

}