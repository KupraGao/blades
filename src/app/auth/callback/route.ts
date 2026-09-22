import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

// =================================================
// AUTH CALLBACK (email confirmation + password recovery)
// =================================================
// Exchanges the Auth PKCE code for a session cookie, then
// redirects to `next` (safe internal path).
// Confirmation default next → /account
// Recovery next → /account/reset-password
// Uses the anon SSR client only.
// =================================================

const RECOVERY_NEXT = "/account/reset-password";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const isRecoveryDestination = next === RECOVERY_NEXT;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth callback exchange failed", {
      code: error.code ?? null,
      status: error.status ?? null,
      recovery: isRecoveryDestination,
    });
  }

  if (isRecoveryDestination) {
    return NextResponse.redirect(
      `${origin}/account/forgot-password?error=recovery`,
    );
  }

  return NextResponse.redirect(
    `${origin}/account/login?error=confirm`,
  );
}
