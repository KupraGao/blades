import { createClient } from "@/lib/supabase/server";

export async function getProducts() {
  const supabase = await createClient();

  // 1️⃣ products + images
  const { data: products, error: pError } = await supabase
    .from("products")
    .select(`
      *,
      product_images (*)
    `);

  if (pError) {
    console.error(pError);
  }

  // 2️⃣ product_categories
  const { data: productCategories, error: pcError } = await supabase
    .from("product_categories")
    .select("*");

  if (pcError) {
    console.error(pcError);
  }

  // 3️⃣ categories
  const { data: categories, error: cError } = await supabase
    .from("categories")
    .select("*");

  if (cError) {
    console.error(cError);
  }

  // 🛡️ null safety
  const safeProducts = products ?? [];
  const safePC = productCategories ?? [];
  const safeCats = categories ?? [];

  // 4️⃣ merge (FINAL)
  const result = safeProducts.map((product: any) => {
    // ყველა relation ამ პროდუქტის
    const relations = safePC.filter(
      (pc: any) => String(pc.product_id) === String(product.id)
    );

    // ამ relation-ებიდან ვპოულობთ კატეგორიებს
    const cats = relations
      .map((rel: any) =>
        safeCats.find(
          (c: any) => String(c.id) === String(rel.category_id)
        )
      )
      .filter(Boolean); // null/undefined ამოიღე

    return {
      ...product,
      product_categories: cats.map((c: any) => ({
        categories: c,
      })),
    };
  });

  return result;
}