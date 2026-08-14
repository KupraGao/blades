"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteProduct(formData:FormData){
  await requireAdmin();

  // =================================================
  // SUPABASE
  // =================================================

  const supabase=createAdminClient();

  // =================================================
  // PRODUCT ID
  // =================================================

  const productId=formData.get("id") as string;

  // =================================================
  // DELETE
  // =================================================

  const{error}=await supabase
    .from("products")
    .delete()
    .eq("id",productId);

  // =================================================
  // DELETE ERROR
  // =================================================

  if(error){

    console.log("DELETE ERROR:",error);

    throw error;

  }

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/products");

}