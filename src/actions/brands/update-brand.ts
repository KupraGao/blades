"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  readOptionalBrandLogo,
  removeStoredBrandLogo,
  uploadBrandLogo,
} from "@/lib/brands/brand-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateBrand(id: number, formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();

  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const logoFile = readOptionalBrandLogo(formData);

  if (!name || !slug) {
    throw new Error("Name and Slug are required.");
  }

  const { data: existing, error: loadError } = await supabase
    .from("brands")
    .select("id, logo")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    console.log("UPDATE BRAND LOAD ERROR:", loadError);
    throw loadError;
  }

  if (!existing) {
    throw new Error("Brand not found.");
  }

  const logo = logoFile ? await uploadBrandLogo(supabase, logoFile) : null;

  const { error } = await supabase
    .from("brands")
    .update({
      name,
      slug,
      ...(logo ? { logo } : {}),
    })
    .eq("id", id);

  if (error) {
    console.log("UPDATE BRAND ERROR:", error);

    if (logo) {
      try {
        await removeStoredBrandLogo(supabase, logo);
      } catch (cleanupError) {
        console.log("BRAND LOGO ORPHAN CLEANUP ERROR:", cleanupError);
      }
    }

    throw error;
  }

  if (logo && existing.logo && existing.logo !== logo) {
    try {
      await removeStoredBrandLogo(supabase, existing.logo);
    } catch (cleanupError) {
      console.log("BRAND LOGO OLD FILE CLEANUP ERROR:", cleanupError);
    }
  }

  redirect("/admin/brands");
}
