"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createBrand(formData: FormData) {

  const supabase = await createClient();

  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const logo = formData.get("logo")?.toString().trim();

  if (!name || !slug) {
    throw new Error("Name and Slug are required.");
  }

  const { error } = await supabase
    .from("brands")
    .insert({
      name,
      slug,
      logo: logo || null,
    });

  if (error) {
    console.log("CREATE BRAND ERROR:", error);
    throw error;
  }

  redirect("/admin/brands");

}