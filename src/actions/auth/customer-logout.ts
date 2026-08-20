"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// =================================================
// CUSTOMER LOGOUT
// =================================================
// Clears Auth session cookies only.
// Does not touch guest Cart / Wishlist localStorage.
// =================================================

export async function logoutCustomer() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Customer logout failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });
  }

  redirect("/");
}
