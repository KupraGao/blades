"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { parseProductForm } from "@/lib/products/parse-product-form";
import { validateProduct } from "@/lib/products/validate-product";
import { productMapper } from "@/lib/products/product-mapper";
import { uploadMainImage } from "@/lib/products/upload-main-image";
import { uploadGalleryImages } from "@/lib/products/upload-gallery-images";
import { attachProductCategories } from "@/lib/products/attach-product-categories";
import { insertMainImage } from "@/lib/products/insert-main-image";
import { insertProduct } from "@/lib/products/insert-product";

export async function createProduct(formData:FormData){

  // =================================================
  // SUPABASE
  // =================================================

  const supabase=await createClient();

  // =================================================
  // FORM DATA
  // =================================================

  const{
    product,
    mainImage,
    galleryImages,
  }=parseProductForm(formData);

  // =================================================
  // VALIDATION
  // =================================================

  validateProduct(product);

  // =================================================
  // PRODUCT
  // =================================================

  const productData=productMapper(product);

  // =================================================
  // MAIN IMAGE UPLOAD
  // =================================================

  const publicUrl=await uploadMainImage(
    supabase,
    mainImage
  );

  // =================================================
  // PRODUCT
  // =================================================

  const productId=await insertProduct(
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