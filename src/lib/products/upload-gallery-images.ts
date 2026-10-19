import { SupabaseClient } from "@supabase/supabase-js";

import {
  PRODUCT_IMAGE_UPLOAD_FAILED,
  productImageStorageFileName,
} from "@/lib/products/product-image-storage-key";

export async function uploadGalleryImages(
  supabase:SupabaseClient,
  productId:number,
  galleryImages:File[]
){

  // =================================================
  // GALLERY LOOP
  // Main image is sort_order 0. Gallery follows upload order: 1, 2, 3...
  // =================================================

  let sortOrder = 1;
  const saved: { id: string; imageUrl: string }[] = [];

  for(const image of galleryImages){

    // =================================================
    // EMPTY FILE SKIP
    // =================================================

    if(!image.name)continue;

    // =================================================
    // FILE NAME
    // =================================================

    const fileName=productImageStorageFileName();

    // =================================================
    // IMAGE UPLOAD
    // =================================================

    const{error:galleryUploadError}=await supabase.storage
      .from("product-images")
      .upload(fileName,image);

    // =================================================
    // UPLOAD ERROR
    // =================================================

    if(galleryUploadError){
      console.log("GALLERY ERROR:",galleryUploadError);
      throw new Error(PRODUCT_IMAGE_UPLOAD_FAILED);
    }

    // =================================================
    // PUBLIC URL
    // =================================================

    const{
      data:{publicUrl},
    }=supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    // =================================================
    // IMAGE INSERT
    // =================================================

    const{data,error:imageInsertError}=await supabase
      .from("product_images")
      .insert([{
        product_id:productId,
        image_url:publicUrl,
        is_main:false,
        sort_order:sortOrder,
      }])
      .select("id, image_url")
      .single();

    if(imageInsertError){
      console.log("IMAGE INSERT ERROR:",imageInsertError);
      throw imageInsertError;
    }

    if(!data?.id || !data.image_url){
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