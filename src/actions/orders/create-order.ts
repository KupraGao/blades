"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  CreateOrderInput,
  consolidateOrderItems,
  validateOrder,
} from "@/lib/orders/validate-order";

import { resolveOrderItems } from "@/lib/orders/resolve-order-items";
import { orderMapper } from "@/lib/orders/order-mapper";
import { insertOrder } from "@/lib/orders/insert-order";
import { insertOrderItems } from "@/lib/orders/insert-order-items";
import {
  deleteOrder,
  deleteOrderWithItems,
} from "@/lib/orders/delete-order";
import { decrementOrderStock } from "@/lib/orders/decrement-product-stock";

// =================================================
// CREATE ORDER
// =================================================

export async function createOrder(
  order: CreateOrderInput,
) {
  // =================================================
  // SUPABASE
  // =================================================

  const supabase = await createClient();

  // =================================================
  // VALIDATION
  // =================================================

  validateOrder(order);

  // =================================================
  // CONSOLIDATE DUPLICATE PRODUCT LINES
  // =================================================

  const consolidatedItems = consolidateOrderItems(
    order.items,
  );

  // =================================================
  // RESOLVE AUTHORITATIVE PRODUCT DATA
  // =================================================

  const resolvedItems = await resolveOrderItems(
    supabase,
    consolidatedItems,
  );

  // =================================================
  // ORDER
  // =================================================

  const orderData = orderMapper(order, resolvedItems);

  // =================================================
  // INSERT ORDER
  // =================================================

  const orderId = await insertOrder(
    supabase,
    orderData,
  );

  // =================================================
  // INSERT ORDER ITEMS
  // =================================================

  try {
    await insertOrderItems(
      supabase,
      orderId,
      resolvedItems,
    );
  } catch (error) {
    try {
      await deleteOrder(supabase, orderId);
    } catch {
      // Best-effort orphan cleanup only.
    }

    throw error;
  }

  // =================================================
  // DECREMENT STOCK
  // =================================================

  try {
    await decrementOrderStock(supabase, resolvedItems);
  } catch (error) {
    try {
      await deleteOrderWithItems(supabase, orderId);
    } catch {
      // Best-effort compensation only.
    }

    throw error;
  }

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/orders");

  // =================================================
  // RESULT
  // =================================================

  return {
    success: true,
    orderId,
  };
}
