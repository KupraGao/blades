"use server";

import { createClient } from "@/lib/supabase/server";

type Props = {
  productIds: string[];
  categoryIds: string[];
};

export async function updateProductCategoriesBulk({
  productIds,
  categoryIds,
}: Props) {
  const supabase = await createClient();

  const insertData = productIds.flatMap((productId) =>
    categoryIds.map((categoryId) => ({
      product_id: productId,
      category_id: categoryId,
    })),
  );


  if (insertData.length === 0) {
    return;
  }


  const { error } = await supabase
    .from("product_categories")
    .upsert(insertData, {
      onConflict: "product_id,category_id",
      ignoreDuplicates: true,
    });


  if (error) {
    throw new Error(error.message);
  }

}