import { createClient } from "@supabase/supabase-js";

// =================================================
// SERVER-ONLY PRIVILEGED SUPABASE CLIENT
// =================================================
// Import this ONLY from server code (e.g. "use server" actions).
// Never import into Client Components or shared browser modules.
// =================================================

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient can only be used on the server.",
    );
  }
}

function getPrivilegedKey() {
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Missing Supabase privileged key. Set SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY on the server.",
    );
  }

  return key;
}

export function createAdminClient() {
  assertServerOnly();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  return createClient(url, getPrivilegedKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
