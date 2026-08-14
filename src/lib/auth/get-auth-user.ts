import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

// =================================================
// AUTHENTICATED USER (identity only — not Admin authz)
// =================================================
// Uses supabase.auth.getUser() so identity is verified
// with the Auth server (not an unverified cookie parse).
//
// authenticated !== authorized Admin
// S2B will add explicit Admin authorization on top of this.
// =================================================

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
