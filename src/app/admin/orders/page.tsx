import { getOrders } from "@/actions/orders/get-orders";
import AdminOrdersListContent from "@/components/admin/orders/AdminOrdersListContent";

export default async function OrdersPage() {
  const orders = await getOrders();

  return <AdminOrdersListContent orders={orders} />;
}
