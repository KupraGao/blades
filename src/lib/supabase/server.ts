import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// =================================================
// SERVER SUPABASE CLIENT (public anon + user cookies)
// =================================================
// Cookie-aware SSR / Server Action client.
// Uses the authenticated user's session when cookies are present.
// Does NOT use the service-role key.
// =================================================

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Session refresh writes are handled by src/proxy.ts.
          }
        },
      },
    },
  );
}
