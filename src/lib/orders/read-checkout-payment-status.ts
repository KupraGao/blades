import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOrderAccessProof } from "@/lib/orders/order-access-proof";

const ORDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CheckoutPaymentViewState =
  | "unavailable"
  | "paid"
  | "pending"
  | "failed"
  | "refund_pending"
  | "refunded";

export type CheckoutPaymentView = {
  state: CheckoutPaymentViewState;
  orderNumber: string | null;
};

export function mapStoredPaymentStatus(
  status: string | null,
): Exclude<CheckoutPaymentViewState, "unavailable"> {
  if (status === "paid") {
    return "paid";
  }

  if (status === "failed") {
    return "failed";
  }

  if (status === "refund_pending") {
    return "refund_pending";
  }

  if (status === "refunded") {
    return "refunded";
  }

  return "pending";
}

function unavailable(): CheckoutPaymentView {
  return { state: "unavailable", orderNumber: null };
}

/**
 * Reads one online order's stored payment status after the checkout access
 * proof is verified. It does not call the bank and does not trust a return URL.
 */
export async function readCheckoutPaymentStatus(
  orderId: string,
): Promise<CheckoutPaymentView> {
  const requestedOrderId = orderId?.trim() ?? "";

  if (!ORDER_UUID.test(requestedOrderId)) {
    return unavailable();
  }

  const allowed = await verifyOrderAccessProof(requestedOrderId);

  if (!allowed) {
    return unavailable();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, payment_status, payment_method")
    .eq("id", requestedOrderId)
    .maybeSingle();

  if (error) {
    console.error("checkout payment status read failed", {
      code: error.code ?? null,
    });
    return unavailable();
  }

  if (
    !data ||
    typeof data.id !== "string" ||
    data.id.toLowerCase() !== requestedOrderId.toLowerCase() ||
    data.payment_method !== "online"
  ) {
    return unavailable();
  }

  const paymentStatus =
    typeof data.payment_status === "string" ? data.payment_status : null;
  const orderNumber =
    typeof data.order_number === "number" || typeof data.order_number === "string"
      ? String(data.order_number)
      : null;

  return {
    state: mapStoredPaymentStatus(paymentStatus),
    orderNumber,
  };
}
