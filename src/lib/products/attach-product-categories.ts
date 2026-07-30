import { SupabaseClient } from "@supabase/supabase-js";

export async function attachProductCategories(
  supabase: SupabaseClient,
  productId: number,
  categories: string[]
) {

  if (categories.length === 0) {

    return;

  }

  const categoryRows =
    categories.map(categoryId => ({
      product_id: productId,
      category_id: categoryId,
    }));

  const {
    error: categoriesError,
  } = await supabase
    .from("product_categories")
    .insert(categoryRows);

  if (categoriesError) {

    console.log(
      "CATEGORIES ERROR:",
      categoriesError
    );

  }

}