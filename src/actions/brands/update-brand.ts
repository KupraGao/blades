"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateBrand(
  id: number,
  formData: FormData
) {
  const supabase = await createClient();

  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const logo = formData.get("logo")?.toString().trim();

  if (!name || !slug) {
    throw new Error("Name and Slug are required.");
  }

  const { error } = await supabase
    .from("brands")
    .update({
      name,
      slug,
      logo: logo || null,
    })
    .eq("id", id);

  if (error) {
    console.log("UPDATE BRAND ERROR:", error);
    throw error;
  }

  redirect("/admin/brands");
}