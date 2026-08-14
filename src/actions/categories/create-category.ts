"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createCategory(formData: FormData) {
  await requireAdmin();

  try {
    const supabase = createAdminClient();

    const name_ka = formData.get("name_ka")?.toString().trim();
    const name_en = formData.get("name_en")?.toString().trim();

    if (!name_ka || !name_en) {
      throw new Error("Category names are required.");
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name_ka,
        name_en,
      })
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      throw error;
    }

    redirect("/admin/categories");
  } catch (err) {
    console.error("CREATE CATEGORY:", err);
    throw err;
  }
}