"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  productIds: string[];
};

export async function deleteProductsBulk({
  productIds,
}: Props) {
  await requireAdmin();

  const supabase = createAdminClient();

  if (productIds.length === 0) {
    return;
  }


  // პროდუქტების კატეგორიებთან კავშირების წაშლა
  const { error: categoryError } = await supabase
    .from("product_categories")
    .delete()
    .in("product_id", productIds);


  if (categoryError) {
    throw new Error(categoryError.message);
  }



  // პროდუქტების სურათების წაშლა
  const { error: imageError } = await supabase
    .from("product_images")
    .delete()
    .in("product_id", productIds);


  if (imageError) {
    throw new Error(imageError.message);
  }



  // პროდუქტების წაშლა
  const { error: productError } = await supabase
    .from("products")
    .delete()
    .in("id", productIds);


  if (productError) {
    throw new Error(productError.message);
  }

}