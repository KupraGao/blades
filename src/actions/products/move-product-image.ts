"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { moveGalleryImageOrder } from "@/lib/products/product-image-order";

export async function moveProductImage(
  productId: string,
  imageId: string,
  direction: "up" | "down",
) {
  await requireAdmin();

  if (!productId || !imageId) {
    throw new Error("Product ID ან Image ID ვერ მოიძებნა.");
  }

  if (direction !== "up" && direction !== "down") {
    throw new Error("Invalid image move direction.");
  }

  const supabase = createAdminClient();

  await moveGalleryImageOrder(
    supabase,
    productId,
    imageId,
    direction,
  );

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/edit/${productId}`);
  revalidatePath(`/products/${productId}`);
}
