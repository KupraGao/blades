import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadMainImage(
  supabase:SupabaseClient,
  mainImage:File
){

  // =================================================
  // IMAGE NAME
  // =================================================

  const fileName=`${crypto.randomUUID()}-${mainImage.name}`;

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
    throw imageError;
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