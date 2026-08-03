import { SupabaseClient } from "@supabase/supabase-js";

export async function attachProductCategories(
  supabase:SupabaseClient,
  productId:string,
  categories:string[]
){

  // =================================================
  // EMPTY CATEGORIES
  // =================================================

  if(!categories.length)return;

  // =================================================
  // CATEGORY ROWS
  // =================================================

  const categoryRows=categories.map(categoryId=>({
    product_id:productId,
    category_id:categoryId,
  }));

  // =================================================
  // INSERT
  // =================================================

  const{error:categoriesError}=await supabase
    .from("product_categories")
    .insert(categoryRows);

  // =================================================
  // INSERT ERROR
  // =================================================

  if(categoriesError){
    console.log("CATEGORIES ERROR:",categoriesError);
    throw categoriesError;
  }

}