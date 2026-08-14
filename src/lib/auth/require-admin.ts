import {
  getAuthorizedAdmin,
  type AuthorizedAdmin,
} from "@/lib/auth/get-authorized-admin";

// =================================================
// REQUIRE ACTIVE ADMIN (S4 — Server Action gate)
// =================================================
// Fail closed. Does not replace DB GRANT/RLS/Storage policies.
// authenticated !== authorized Admin
// =================================================

export async function requireAdmin(): Promise<AuthorizedAdmin> {
  const admin = await getAuthorizedAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  return admin;
}
