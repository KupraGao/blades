"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// =================================================
// LOGOUT
// =================================================
// Clears the Supabase Auth session cookies.
// Does not touch guest Cart / Wishlist storage.
// =================================================

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Admin logout failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });
  }

  redirect("/admin/login");
}
