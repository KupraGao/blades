import { getSingleOrder } from "@/actions/orders/get-single-order";
import CheckoutSuccessContent from "@/components/checkout/CheckoutSuccessContent";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function CheckoutSuccessPage({
  params,
}: Props) {
  const { orderId } = await params;
  const order = await getSingleOrder(orderId);

  return <CheckoutSuccessContent order={order} />;
}
