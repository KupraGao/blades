import { getAdminDashboardData } from "@/actions/admin/get-admin-dashboard-data";
import AdminDashboardContent from "@/components/admin/dashboard/AdminDashboardContent";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return <AdminDashboardContent data={data} />;
}
