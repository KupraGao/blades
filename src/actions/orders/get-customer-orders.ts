"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { mapOrderItemProductDisplay } from "@/lib/orders/map-order-item-product-display";
import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// GET CUSTOMER ORDERS (S6D)
// =================================================
// Authenticated Customer only. Ownership filter is
// server-derived user.id — never from the client.
// =================================================

export type CustomerOrderListItem = {
  id: string;
  order_number: number | null;
  status: string;
  fulfillment_method: string | null;
  total_price: number;
  created_at: string;
  order_items: Array<{
    product_title: string;
    quantity: number;
    image_url: string | null;
    product_href: string | null;
  }>;
};

export async function getCustomerOrders(): Promise<CustomerOrderListItem[]> {
  const user = await getAuthUser();

  if (!user) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      fulfillment_method,
      total_price,
      created_at,
      order_items (
        product_title,
        quantity,
        products (
          id,
          product_images (
            image_url,
            is_main
          )
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCustomerOrders error", {
      code: error.code ?? null,
    });
    return [];
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    fulfillment_method: order.fulfillment_method,
    total_price: order.total_price,
    created_at: order.created_at,
    order_items: Array.isArray(order.order_items)
      ? order.order_items.map((item: any) => {
          const mapped = mapOrderItemProductDisplay(item);
          return {
            product_title: mapped.product_title,
            quantity: mapped.quantity,
            image_url: mapped.image_url,
            product_href: mapped.product_href,
          };
        })
      : [],
  }));
}
