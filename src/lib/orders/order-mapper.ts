import { CreateOrderInput } from "./validate-order";

// =================================================
// ORDER MAPPER
// =================================================

export function orderMapper(order: CreateOrderInput) {
  // =================================================
  // ORDER
  // =================================================

  return {
    customer_name: order.customerName.trim(),

    customer_phone: order.customerPhone.trim(),

    customer_email:
      order.customerEmail?.trim() || null,

    customer_address:
      order.customerAddress.trim(),

    customer_note:
      order.customerNote?.trim() || null,

    total_price: order.items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    ),

    status: "pending",
  };
}