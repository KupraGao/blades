"use server";

import { createClient } from "@/lib/supabase/server";

export async function createProduct(
  formData: FormData
) {

  // supabase client

  const supabase =
    await createClient();

  // form values

  const title =
    formData.get("title");

  const price =
    formData.get("price");

  const stock =
    formData.get("stock");

  const description =
    formData.get("description");

  // insert

  const { data, error } =
    await supabase
      .from("products")
      .insert([
        {
          title,
          price,
          stock,
          description,
        },
      ])
      .select();

  // error

  if (error) {

    console.log("ERROR:", error);

    return;

  }

  // success

 console.log("DATA:", data);


}