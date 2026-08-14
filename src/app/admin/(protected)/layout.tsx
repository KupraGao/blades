import { redirect } from "next/navigation";

import AdminLayout from "@/components/admin/layout/AdminLayout";
import { getAuthorizedAdmin } from "@/lib/auth/get-authorized-admin";

// =================================================
// PROTECTED ADMIN ROUTES (S3)
// =================================================
// Route/UI gate using active Admin authorization.
// Does NOT replace S4 requireAdmin() on Server Actions.
// =================================================

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthorizedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <AdminLayout adminDisplayName={admin.displayName}>
      {children}
    </AdminLayout>
  );
}
