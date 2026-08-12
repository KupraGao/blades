import {
  CreateOrderInput,
  ResolvedOrderItem,
} from "./validate-order";

// =================================================
// ORDER MAPPER
// =================================================

export function orderMapper(
  order: CreateOrderInput,
  items: ResolvedOrderItem[],
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

    total_price: items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0,
    ),

    status: "pending",
  };
}
