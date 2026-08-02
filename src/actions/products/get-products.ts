"use server";

import { createClient } from "@/lib/supabase/server";

type GetProductsOptions={
  categoryId?:string;
  search?:string;
};

export async function getProducts({
  categoryId,
  search,
}:GetProductsOptions={}){

  const supabase=await createClient();

  let query=supabase
    .from("products")
    .select(`
      *,
      brands(id,name,slug,logo),
      product_images(id,image_url,is_main),
      product_categories(category_id,categories(id,name_ka,name_en))
    `)
    .order("created_at",{ascending:false});

  if(categoryId){
    query=query.eq("product_categories.category_id",categoryId);
  }

if(search){
  query=query.or(
    `title.ilike.%${search}%,knife_type.ilike.%${search}%,blade_steel.ilike.%${search}%,handle_material.ilike.%${search}%,country.ilike.%${search}%`
  );
}

  const{data,error}=await query;

  if(error){
    console.log("PRODUCTS FETCH ERROR:",error);
    return [];
  }

  return data;

}