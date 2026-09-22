import { getAdminCustomer } from "@/actions/admin/get-admin-customer";
import AdminUserDetailsContent from "@/components/admin/users/AdminUserDetailsContent";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminUserDetailsPage({ params }: Props) {
  const { id } = await params;
  const result = await getAdminCustomer(id);

  return (
    <AdminUserDetailsContent
      customer={result?.customer ?? null}
      orders={result?.orders ?? []}
    />
  );
}
