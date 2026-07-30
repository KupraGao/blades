"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSingleProduct(id:string){

  const supabase=await createClient();

  const{data,error}=await supabase
    .from("products")
    .select(`
      *,
      brands(*),
      product_images(*),
      product_categories(
        category_id
      )
    `)
    .eq("id",id)
    .single();

  if(error){
    console.log(error);
    return null;
  }

  return data;

}