import CheckoutPaymentStatusContent from "@/components/checkout/CheckoutPaymentStatusContent";
import { readCheckoutPaymentStatus } from "@/lib/orders/read-checkout-payment-status";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function CheckoutPaymentStatusPage({ params }: Props) {
  const { orderId } = await params;
  const payment = await readCheckoutPaymentStatus(orderId);

  return <CheckoutPaymentStatusContent payment={payment} />;
}
