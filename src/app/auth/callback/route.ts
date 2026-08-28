import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

// =================================================
// AUTH CALLBACK (Customer email confirmation / PKCE)
// =================================================
// Exchanges the Auth code for a session cookie, then
// redirects into the app. Uses the anon SSR client only.
// =================================================

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth callback exchange failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });
  }

  return NextResponse.redirect(
    `${origin}/account/login?error=confirm`,
  );
}
