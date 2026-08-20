import { getGuestSuccessOrder } from "@/actions/orders/get-guest-success-order";
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
  const order = await getGuestSuccessOrder(orderId);

  return <CheckoutSuccessContent order={order} />;
}
