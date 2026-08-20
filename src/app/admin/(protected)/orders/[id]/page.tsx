import { getAdminOrder } from "@/actions/orders/get-admin-order";
import AdminOrderDetailsContent from "@/components/admin/orders/AdminOrderDetailsContent";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailsPage({
  params,
}: Props) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  return <AdminOrderDetailsContent order={order} />;
}
