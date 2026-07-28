import { SupabaseClient } from "@supabase/supabase-js";
import { productMapper } from "./product-mapper";

export async function insertProduct(
  supabase: SupabaseClient,
  productData: ReturnType<typeof productMapper>
) {

  // =================================================
  // PRODUCT INSERT
  // =================================================

  const { data, error } =
    await supabase
      .from("products")
      .insert([
        productData,
      ])
      .select();


  // =================================================
  // INSERT ERROR
  // =================================================

  if (error) {

    console.log(
      "ERROR:",
      error
    );

    throw error;

  }


  // =================================================
  // DATA CHECK
  // =================================================

  if (!data) {

    throw new Error(
      "პროდუქტის შექმნა ვერ მოხერხდა."
    );

  }


  // =================================================
  // PRODUCT ID
  // =================================================

  return data[0].id;

}