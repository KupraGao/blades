"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// =================================================
// ADMIN LOGIN (authentication only)
// =================================================
// Establishes a Supabase Auth session.
// Does NOT grant Admin authorization (S2B).
// authenticated !== authorized Admin
// =================================================

export type LoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      errorKey: "adminLoginInvalidCredentials" | "adminLoginFailed";
    };

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResult> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password;

  if (!trimmedEmail || !trimmedPassword) {
    return {
      success: false,
      errorKey: "adminLoginInvalidCredentials",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error) {
    // Do not leak Auth provider details to the UI.
    console.error("Admin login failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });

    return {
      success: false,
      errorKey: "adminLoginInvalidCredentials",
    };
  }

  // Temporary post-login landing until S2B/S3 harden /admin.
  // Baseline already exposes /admin publicly; Auth does not worsen that.
  redirect("/admin");
}
