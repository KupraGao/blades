import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/update-session";

// =================================================
// Next.js Proxy — Auth session maintenance only
// =================================================
// This is NOT Admin route protection (S3).
// This is NOT Admin authorization (S2B).
// =================================================

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     * Needed so Auth cookies can refresh on navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
