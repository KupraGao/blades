"use server";

import { redirect } from "next/navigation";

import { getAuthorizedAdmin } from "@/lib/auth/get-authorized-admin";
import { createClient } from "@/lib/supabase/server";

// =================================================
// ADMIN LOGIN (authentication + Admin authorization)
// =================================================
// signInWithPassword proves identity.
// getAuthorizedAdmin() proves Admin authorization.
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
    console.error("Admin login failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });

    return {
      success: false,
      errorKey: "adminLoginInvalidCredentials",
    };
  }

  const admin = await getAuthorizedAdmin();

  if (!admin) {
    // Non-Admin or disabled Admin: clear session; generic error only.
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Admin unauthorized sign-out failed", {
        code: signOutError.code ?? null,
        status: signOutError.status ?? null,
      });
    }

    return {
      success: false,
      errorKey: "adminLoginInvalidCredentials",
    };
  }

  redirect("/admin");
}
