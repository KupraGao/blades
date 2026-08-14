import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-auth-user";

// =================================================
// AUTHORIZED ADMIN (authorization — not authentication)
// =================================================
// authenticated !== authorized Admin
//
// Lookup uses the privileged server client because
// public.admin_users is intentionally unavailable to
// anon / authenticated PostgREST roles.
// =================================================

export type AuthorizedAdmin = {
  id: string;
  email: string | null;
  displayName: string;
};

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error(
      "getAuthorizedAdmin can only be used on the server.",
    );
  }
}

export async function getAuthorizedAdmin(): Promise<AuthorizedAdmin | null> {
  assertServerOnly();

  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id, display_name, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Authorized Admin lookup failed", {
        code: error.code ?? null,
        message: error.message ?? null,
      });
      return null;
    }

    if (!data || data.is_active !== true) {
      return null;
    }

    const displayName = String(data.display_name ?? "").trim();

    if (!displayName) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? null,
      displayName,
    };
  } catch (error) {
    console.error("Authorized Admin lookup exception", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return null;
  }
}
