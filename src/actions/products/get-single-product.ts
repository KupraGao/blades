"use server";

import { createClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGES_NESTED_ORDER } from "@/lib/products/sort-product-images";

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
    .order("sort_order", PRODUCT_IMAGES_NESTED_ORDER)
    .single();

  if(error){
    console.log(error);
    return null;
  }

  return data;

}