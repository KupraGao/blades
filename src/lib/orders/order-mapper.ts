import {
  CreateOrderInput,
  ResolvedOrderItem,
} from "./validate-order";
import { CREATE_ORDER_PAYMENT_STATUS } from "./payment-rules";

// =================================================
// ORDER MAPPER
// =================================================
// userId is server-derived only (getAuthUser). Never from
// CreateOrderInput / client. Guest → null; Customer → auth id.
// payment_status is server-authoritative (S7B: always unpaid).
// =================================================

export function orderMapper(
  order: CreateOrderInput,
  items: ResolvedOrderItem[],
  userId: string | null = null,
) {
  // =================================================
  // ORDER
  // =================================================

  const isPickup = order.fulfillmentMethod === "pickup";

  return {
    customer_name: order.customerName.trim(),

    customer_phone: order.customerPhone.trim(),

    customer_email:
      order.customerEmail?.trim() || null,

    customer_address: isPickup
      ? null
      : (order.customerAddress?.trim() ?? ""),

    customer_note:
      order.customerNote?.trim() || null,

    fulfillment_method: order.fulfillmentMethod,

    payment_method: order.paymentMethod,

    payment_status: CREATE_ORDER_PAYMENT_STATUS,

    total_price: items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0,
    ),

    status: "pending",

    // S6E: attach only when server resolved an authenticated user.
    user_id: userId,
  };
}
