import { createBrowserClient } from "@supabase/ssr";

// =================================================
// BROWSER SUPABASE CLIENT (public anon key only)
// =================================================
// Safe for Client Components. Never import privileged keys here.
// Ready for future client-side Auth flows (e.g. OAuth redirects).
// =================================================

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient(url, anonKey);
}
