"use server";

import { verifyOrderAccessProof } from "@/lib/orders/order-access-proof";
import { loadOrderById } from "@/lib/orders/load-order-by-id";
import { mapOrderItemProductDisplay } from "@/lib/orders/map-order-item-product-display";

// =================================================
// GET GUEST SUCCESS ORDER
// =================================================
// UUID alone does NOT authorize. Valid short-lived
// httpOnly HMAC proof for this exact orderId required.
// Missing/invalid/expired/mismatched proof → null
// (same UX as not found; do not leak existence).
// =================================================

export async function getGuestSuccessOrder(id: string) {
  const allowed = await verifyOrderAccessProof(id);

  if (!allowed) {
    return null;
  }

  const order = await loadOrderById(id);

  if (!order) {
    return null;
  }

  return {
    ...order,
    order_items: Array.isArray(order.order_items)
      ? order.order_items.map((item: any) => {
          const mapped = mapOrderItemProductDisplay(item);
          return {
            id: mapped.id ?? String(item?.id ?? ""),
            product_id: item?.product_id ?? null,
            product_title: mapped.product_title,
            product_price: mapped.product_price,
            quantity: mapped.quantity,
            image_url: mapped.image_url,
            product_href: mapped.product_href,
          };
        })
      : [],
  };
}
