"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteBrand(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/brands");
}