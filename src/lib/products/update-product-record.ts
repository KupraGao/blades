import { SupabaseClient } from "@supabase/supabase-js";
import { productMapper } from "./product-mapper";

export async function updateProductRecord(
  supabase:SupabaseClient,
  productId:string,
  productData:ReturnType<typeof productMapper>
){

  // =================================================
  // PRODUCT UPDATE
  // =================================================

  const{error}=await supabase
    .from("products")
    .update(productData)
    .eq("id",productId);

  // =================================================
  // UPDATE ERROR
  // =================================================

  if(error){
    console.log("UPDATE ERROR:",error);
    throw error;
  }

}