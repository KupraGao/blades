"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  readOptionalBrandLogo,
  removeStoredBrandLogo,
  uploadBrandLogo,
} from "@/lib/brands/brand-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBrand(formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();

  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const logoFile = readOptionalBrandLogo(formData);

  if (!name || !slug) {
    throw new Error("Name and Slug are required.");
  }

  const logo = logoFile ? await uploadBrandLogo(supabase, logoFile) : null;

  const { error } = await supabase.from("brands").insert({
    name,
    slug,
    logo,
  });

  if (error) {
    console.log("CREATE BRAND ERROR:", error);

    if (logo) {
      try {
        await removeStoredBrandLogo(supabase, logo);
      } catch (cleanupError) {
        console.log("BRAND LOGO ORPHAN CLEANUP ERROR:", cleanupError);
      }
    }

    throw error;
  }

  redirect("/admin/brands");
}
