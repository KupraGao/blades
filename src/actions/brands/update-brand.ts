"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateBrand(
  id: number,
  formData: FormData
) {
  await requireAdmin();

  const supabase = createAdminClient();

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