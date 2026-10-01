"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

import { parseProductForm } from "@/lib/products/parse-product-form";
import { validateProduct } from "@/lib/products/validate-product";
import { productMapper } from "@/lib/products/product-mapper";
import { updateProductRecord } from "@/lib/products/update-product-record";
import { attachProductCategories } from "@/lib/products/attach-product-categories";
import { uploadMainImage } from "@/lib/products/upload-main-image";
import { changeMainImageRecord } from "@/lib/products/change-main-image-record";
import { uploadGalleryImagesRecord } from "@/lib/products/upload-gallery-images-record";
import {
  applyMainImageSortOrder,
  getNextGallerySortOrder,
} from "@/lib/products/product-image-order";

export async function updateProduct(
  productId: string,
  formData: FormData
) {
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
    .eq("product_id", productId);

  await attachProductCategories(
    supabase,
    productId,
    product.categories
  );

  // =================================================
  // CHANGE MAIN IMAGE
  // New file → new product_images row (same as create/gallery),
  // then promote by record UUID. Do not pass a Storage URL into id.
  // =================================================

  if (mainImage) {

    const imageUrl = await uploadMainImage(
      supabase,
      mainImage
    );

    let insertedImageId: string | null = null;

    try {
      const nextSortOrder = await getNextGallerySortOrder(
        supabase,
        productId
      );

      const { data: insertedImage, error: insertError } = await supabase
        .from("product_images")
        .insert([
          {
            product_id: productId,
            image_url: imageUrl,
            is_main: false,
            sort_order: nextSortOrder,
          },
        ])
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (!insertedImage?.id) {
        throw new Error("Main image record was not created.");
      }

      insertedImageId = String(insertedImage.id);

      await changeMainImageRecord(
        supabase,
        productId,
        insertedImageId
      );

      await applyMainImageSortOrder(
        supabase,
        productId,
        insertedImageId
      );
    } catch (error) {
      if (!insertedImageId) {
        const fileName = imageUrl.split("/").pop();

        if (fileName) {
          try {
            await supabase.storage.from("product-images").remove([fileName]);
          } catch {
            // Best-effort: do not mask the original insert/upload failure.
          }
        }
      }

      throw error;
    }

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