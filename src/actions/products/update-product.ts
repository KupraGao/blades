"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { parseProductForm } from "@/lib/products/parse-product-form";
import { validateProduct } from "@/lib/products/validate-product";
import { productMapper } from "@/lib/products/product-mapper";
import { updateProductRecord } from "@/lib/products/update-product-record";
import { attachProductCategories } from "@/lib/products/attach-product-categories";
import { uploadMainImage } from "@/lib/products/upload-main-image";
import { changeMainImageRecord } from "@/lib/products/change-main-image-record";
import { uploadGalleryImagesRecord } from "@/lib/products/upload-gallery-images-record";

export async function updateProduct(
  productId: string,
  formData: FormData
) {

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = await createClient();

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
  // PRODUCT
  // =================================================

  const productData = productMapper(product);

  // =================================================
  // UPDATE PRODUCT
  // =================================================

  await updateProductRecord(
    supabase,
    productId,
    productData
  );

  // =================================================
  // UPDATE CATEGORIES
  // =================================================

  await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", Number(productId));

  await attachProductCategories(
    supabase,
    Number(productId),
    product.categories
  );

  // =================================================
  // CHANGE MAIN IMAGE
  // =================================================

  if (mainImage) {

    const imageUrl = await uploadMainImage(
      supabase,
      mainImage
    );

    await changeMainImageRecord(
      supabase,
      productId,
      imageUrl
    );

  }

  // =================================================
  // UPLOAD GALLERY IMAGES
  // =================================================

  if (galleryImages.length > 0) {

    await uploadGalleryImagesRecord({
      supabase,
      productId,
      images: galleryImages,
    });

  }

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");

  // =================================================
  // REDIRECT
  // =================================================

  redirect("/admin/products");

}