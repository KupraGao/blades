"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateCategory(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const name_ka = formData.get("name_ka")?.toString().trim();
  const name_en = formData.get("name_en")?.toString().trim();

  if (!name_ka || !name_en) {
    throw new Error("Category names are required.");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name_ka,
      name_en,
    })
    .eq("id", id);

  if (error) {
    console.log("UPDATE CATEGORY ERROR:", error);
    throw error;
  }

  redirect("/admin/categories");
}