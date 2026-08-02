"use server";

import { createClient } from "@/lib/supabase/server";

type GetProductsOptions={
  categoryId?:string;
  search?:string;
  sort?:string;
  page?:number;
  limit?:number;
};

export async function getProducts({
  categoryId,
  search,
  sort,
  page=1,
  limit=20,
}:GetProductsOptions={}){

  const supabase=await createClient();

  let query=supabase
    .from("products")
    .select(`
      *,
      brands(id,name,slug,logo),
      product_images(id,image_url,is_main),
      product_categories(category_id,categories(id,name_ka,name_en))
    `,{
      count:"exact",
    });

  if(categoryId){
    query=query.eq("product_categories.category_id",categoryId);
  }

  if(search){
    query=query.or(
      `title.ilike.%${search}%,knife_type.ilike.%${search}%,blade_steel.ilike.%${search}%,handle_material.ilike.%${search}%,country.ilike.%${search}%`
    );
  }

  switch(sort){

    case "oldest":
      query=query.order("created_at",{ascending:true});
      break;

    case "price-asc":
      query=query.order("price",{ascending:true});
      break;

    case "price-desc":
      query=query.order("price",{ascending:false});
      break;

    case "name-asc":
      query=query.order("title",{ascending:true});
      break;

    case "name-desc":
      query=query.order("title",{ascending:false});
      break;

    default:
      query=query.order("created_at",{ascending:false});

  }

  const from=(page-1)*limit;
  const to=from+limit-1;

  query=query.range(from,to);

  const{
    data,
    error,
    count,
  }=await query;

  if(error){
    console.log("PRODUCTS FETCH ERROR:",error);

    return{
      products:[],
      totalPages:0,
    };
  }

  return{
    products:data,
    totalPages:Math.ceil((count??0)/limit),
  };

}