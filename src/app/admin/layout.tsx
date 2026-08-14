import AdminLayout from "@/components/admin/layout/AdminLayout";
import { getAuthorizedAdmin } from "@/lib/auth/get-authorized-admin";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Identity for UI only — not full /admin route protection (S3).
  const admin = await getAuthorizedAdmin();

  return (
    <AdminLayout adminDisplayName={admin?.displayName ?? null}>
      {children}
    </AdminLayout>
  );
}
