import CustomerOrderDetails from "@/components/account/CustomerOrderDetails";
import { getCustomerOrder } from "@/actions/orders/get-customer-order";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function CustomerOrderDetailsPage({
  params,
}: Props) {
  const { orderId } = await params;
  const order = await getCustomerOrder(orderId);

  return <CustomerOrderDetails order={order} />;
}
