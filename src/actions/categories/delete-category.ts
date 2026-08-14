"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteCategory(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/categories");

}