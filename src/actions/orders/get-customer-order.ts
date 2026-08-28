"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { mapOrderItemProductDisplay } from "@/lib/orders/map-order-item-product-display";
import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// GET CUSTOMER ORDER (S6D)
// =================================================
// Requires authenticated Customer. Query constrains
// BOTH id and user_id = auth user.id in one query.
// Do not load by id alone then check ownership.
// =================================================

export async function getCustomerOrder(orderId: string) {
  const trimmedId = typeof orderId === "string" ? orderId.trim() : "";

  if (!trimmedId) {
    return null;
  }

  const user = await getAuthUser();

  if (!user) {
    return null;
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
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      order_items (
        id,
        product_id,
        product_title,
        product_price,
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
    .eq("id", trimmedId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCustomerOrder error", {
      code: error.code ?? null,
    });
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    order_items: Array.isArray(data.order_items)
      ? data.order_items.map((item: any) => {
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
