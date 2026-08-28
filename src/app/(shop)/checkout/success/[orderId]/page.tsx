import { getGuestSuccessOrder } from "@/actions/orders/get-guest-success-order";
import CheckoutSuccessContent from "@/components/checkout/CheckoutSuccessContent";
import { getAuthUser } from "@/lib/auth/get-auth-user";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function CheckoutSuccessPage({
  params,
}: Props) {
  const { orderId } = await params;
  const [order, user] = await Promise.all([
    getGuestSuccessOrder(orderId),
    getAuthUser(),
  ]);

  const isAuthenticated = Boolean(user);
  const isOwnedByCurrentUser = Boolean(
    order && user && order.user_id === user.id,
  );
  const canClaim = Boolean(
    order && user && order.user_id == null,
  );

  return (
    <CheckoutSuccessContent
      order={order}
      orderId={orderId}
      isAuthenticated={isAuthenticated}
      canClaim={canClaim}
      isOwnedByCurrentUser={isOwnedByCurrentUser}
    />
  );
}
