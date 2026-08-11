import { getSingleOrder } from "@/actions/orders/get-single-order";
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
  const order = await getSingleOrder(id);

  return <AdminOrderDetailsContent order={order} />;
}
