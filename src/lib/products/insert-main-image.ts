import { SupabaseClient } from "@supabase/supabase-js";

export async function insertMainImage(
  supabase:SupabaseClient,
  productId:number,
  publicUrl:string
){

  const{data,error:imageInsertError}=await supabase
    .from("product_images")
    .insert([
      {
        product_id:productId,
        image_url:publicUrl,
        is_main:true,
        sort_order:0,
      },
    ])
    .select("id, image_url")
    .single();

  if(imageInsertError){
    console.log("IMAGE INSERT ERROR:",imageInsertError);
    throw imageInsertError;
  }

  if(!data?.id || !data.image_url){
    throw new Error("IMAGE INSERT ERROR");
  }

  return {
    id: String(data.id),
    imageUrl: data.image_url,
  };

}