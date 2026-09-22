"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

// =================================================
// REQUEST CUSTOMER PASSWORD RESET
// =================================================
// Uses anon SSR Auth client only.
// Always returns a neutral success UX for valid emails
// to avoid account enumeration (including Auth errors).
// =================================================

export type RequestPasswordResetResult =
  | {
      success: true;
    }
  | {
      success: false;
      errorKey:
        | "accountAuthInvalidEmail"
        | "accountForgotPasswordFailed";
    };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function resolvePasswordResetRedirectTo() {
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    null;

  if (!origin) {
    return null;
  }

  const next = encodeURIComponent("/account/reset-password");
  return `${origin.replace(/\/$/, "")}/auth/callback?next=${next}`;
}

export async function requestPasswordReset(
  email: string,
): Promise<RequestPasswordResetResult> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return {
      success: false,
      errorKey: "accountAuthInvalidEmail",
    };
  }

  const redirectTo = await resolvePasswordResetRedirectTo();

  if (!redirectTo) {
    console.error("Password reset redirect origin unavailable");
    return {
      success: false,
      errorKey: "accountForgotPasswordFailed",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    trimmedEmail,
    {
      redirectTo,
    },
  );

  if (error) {
    // Do not reveal whether the email exists.
    console.error("Password reset request failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });
  }

  return {
    success: true,
  };
}
