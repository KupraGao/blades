"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { parseProductForm } from "@/lib/products/parse-product-form";
import { validateProduct } from "@/lib/products/validate-product";
import { productMapper } from "@/lib/products/product-mapper";
import { updateProductRecord } from "@/lib/products/update-product-record";

export async function updateProduct(
  productId:string,
  formData:FormData
){

  // =================================================
  // SUPABASE
  // =================================================

  const supabase=await createClient();

  // =================================================
  // FORM DATA
  // =================================================

  const{product}=parseProductForm(formData);

  // =================================================
  // VALIDATION
  // =================================================

  validateProduct(product);

  // =================================================
  // PRODUCT
  // =================================================

  const productData=productMapper(product);

  // =================================================
  // UPDATE
  // =================================================

  await updateProductRecord(
    supabase,
    productId,
    productData
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