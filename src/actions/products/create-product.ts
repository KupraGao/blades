"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseProductForm } from "@/lib/products/parse-product-form";
import { validateProduct } from "@/lib/products/validate-product";
import { productMapper } from "@/lib/products/product-mapper";
import { uploadMainImage } from "@/lib/products/upload-main-image";
import { uploadGalleryImages } from "@/lib/products/upload-gallery-images";
import { attachProductCategories } from "@/lib/products/attach-product-categories";
import { insertMainImage } from "@/lib/products/insert-main-image";
import { insertProduct } from "@/lib/products/insert-product";

export async function createProduct(formData: FormData) {
  await requireAdmin();

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // FORM DATA
  // =================================================

  const {
    product,
    mainImage,
    galleryImages,
  } = parseProductForm(formData);

  // =================================================
  // VALIDATION
  // =================================================

  validateProduct(product);

  // =================================================
  // MAIN IMAGE REQUIRED
  // =================================================

  if (!mainImage) {
    throw new Error("მთავარი ფოტო აუცილებელია.");
  }

  // =================================================
  // PRODUCT
  // =================================================

  const productData = productMapper(product);

  // =================================================
  // MAIN IMAGE UPLOAD
  // =================================================

  const publicUrl = await uploadMainImage(
    supabase,
    mainImage
  );

  // =================================================
  // PRODUCT
  // =================================================

  const productId = await insertProduct(
    supabase,
    productData
  );

  // =================================================
  // PRODUCT CATEGORIES
  // =================================================

  await attachProductCategories(
    supabase,
    productId,
    product.categories
  );

  // =================================================
  // MAIN IMAGE
  // =================================================

  await insertMainImage(
    supabase,
    productId,
    publicUrl
  );

  // =================================================
  // GALLERY IMAGES
  // =================================================

  await uploadGalleryImages(
    supabase,
    productId,
    galleryImages
  );

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");

  // =================================================
  // REDIRECT
  // =================================================

  redirect("/admin/products");

}