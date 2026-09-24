import { SupabaseClient } from "@supabase/supabase-js";

import {
  PRODUCT_IMAGE_UPLOAD_FAILED,
  productImageStorageFileName,
} from "@/lib/products/product-image-storage-key";

export async function uploadMainImage(
  supabase:SupabaseClient,
  mainImage:File
){

  // =================================================
  // IMAGE NAME
  // =================================================

  const fileName=productImageStorageFileName();

  // =================================================
  // STORAGE UPLOAD
  // =================================================

  const{error:imageError}=await supabase.storage
    .from("product-images")
    .upload(fileName,mainImage);

  // =================================================
  // IMAGE ERROR
  // =================================================

  if(imageError){
    console.log("IMAGE ERROR:",imageError);
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

  return publicUrl;

}