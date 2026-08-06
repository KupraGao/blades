"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  CreateOrderInput,
  validateOrder,
} from "@/lib/orders/validate-order";

import { orderMapper } from "@/lib/orders/order-mapper";
import { insertOrder } from "@/lib/orders/insert-order";
import { insertOrderItems } from "@/lib/orders/insert-order-items";

// =================================================
// CREATE ORDER
// =================================================

export async function createOrder(
  order: CreateOrderInput
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
  // ORDER
  // =================================================

  const orderData = orderMapper(order);

  // =================================================
  // INSERT ORDER
  // =================================================

  const orderId = await insertOrder(
    supabase,
    orderData
  );

  // =================================================
  // INSERT ORDER ITEMS
  // =================================================

  await insertOrderItems(
    supabase,
    orderId,
    order.items
  );

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