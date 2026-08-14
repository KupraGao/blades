import { redirect } from "next/navigation";

import AdminLoginForm from "@/components/admin/auth/AdminLoginForm";
import { getAuthorizedAdmin } from "@/lib/auth/get-authorized-admin";

export default async function AdminLoginPage() {
  const admin = await getAuthorizedAdmin();

  if (admin) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}
