import { createClient } from "@/lib/supabase/server";

export async function getProducts() {
  try {
    const supabase = await createClient();

    const { data: products, error: pError } = await supabase
      .from("products")
      .select(`*, product_images(*)`);

    if (pError) {
      console.error("Products error:", pError);
      return [];
    }

    const { data: productCategories, error: pcError } = await supabase
      .from("product_categories")
      .select("*");

    if (pcError) {
      console.error("ProductCategories error:", pcError);
      return [];
    }

    const { data: categories, error: cError } = await supabase
      .from("categories")
      .select("*");

    if (cError) {
      console.error("Categories error:", cError);
      return [];
    }

    const safeProducts = products || [];
    const safeProductCategories = productCategories || [];
    const safeCategories = categories || [];

    const result = safeProducts.map((product: any) => {
      const relations = safeProductCategories.filter(
        (pc: any) => pc.product_id === product.id
      );

      const cats = relations
        .map((rel: any) =>
          safeCategories.find(
            (c: any) => String(c.id) === String(rel.category_id)
          )
        )
        .filter(Boolean);

      return {
        ...product,
        product_categories: cats.map((c: any) => ({
          categories: c,
        })),
      };
    });

    return result;
  } catch (err) {
    console.error("FATAL getProducts:", err);
    return [];
  }
}