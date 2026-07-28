"use server";

import { createClient } from "@/lib/supabase/server";
import { parseProductForm } from "@/lib/products/parse-product-form";
import { validateProduct } from "@/lib/products/validate-product";
import { productMapper } from "@/lib/products/product-mapper";
import { uploadMainImage } from "@/lib/products/upload-main-image";
import { uploadGalleryImages } from "@/lib/products/upload-gallery-images";
import { attachProductCategories } from "@/lib/products/attach-product-categories";
import { insertMainImage } from "@/lib/products/insert-main-image";
import { insertProduct } from "@/lib/products/insert-product";

export async function createProduct(
  formData: FormData
) {

  // =================================================
  // SUPABASE
  // =================================================

  const supabase =
    await createClient();


  // =================================================
  // PRODUCT
  // =================================================

  const product = parseProductForm(formData);

validateProduct(product);

const productData = productMapper(product);



  // =================================================
  // MAIN IMAGE
  // =================================================

  const mainImage =
    formData.get("mainImage") as File;


  // =================================================
  // GALLERY IMAGES
  // =================================================

  const galleryImages =
    formData.getAll(
      "galleryImages"
    ) as File[];


// =================================================
// MAIN IMAGE UPLOAD
// =================================================

const publicUrl =
  await uploadMainImage(
    supabase,
    mainImage
  );

// =================================================
// PRODUCT
// =================================================

const productId =
  await insertProduct(
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
// SUCCESS
// =================================================

console.log(
  "PRODUCT CREATED"
)
};