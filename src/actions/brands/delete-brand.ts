"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteBrand(formData: FormData) {

  const id = Number(formData.get("id"));

  const supabase = await createClient();

  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/brands");
}