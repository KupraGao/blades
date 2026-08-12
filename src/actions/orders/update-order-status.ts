"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  canTransitionOrderStatus,
  isOrderStatus,
} from "@/lib/orders/order-status";
import { updateOrderStatusRecord } from "@/lib/orders/update-order-status-record";

// =================================================
// UPDATE ORDER STATUS
// =================================================

export type UpdateOrderStatusResult =
  | {
      success: true;
      status: string;
    }
  | {
      success: false;
      error: string;
    };

export async function updateOrderStatus(
  orderId: string,
  targetStatus: string,
): Promise<UpdateOrderStatusResult> {
  // =================================================
  // INPUT VALIDATION
  // =================================================

  if (!orderId || !orderId.trim()) {
    return {
      success: false,
      error: "Order ID is required.",
    };
  }

  if (!isOrderStatus(targetStatus)) {
    return {
      success: false,
      error: "Invalid order status.",
    };
  }

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // LOAD AUTHORITATIVE CURRENT STATUS
  // =================================================

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, fulfillment_method")
    .eq("id", orderId.trim())
    .maybeSingle();

  if (error) {
    console.error("=== SUPABASE ORDER STATUS LOAD ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);

    return {
      success: false,
      error: "Unable to load order status.",
    };
  }

  if (!order) {
    return {
      success: false,
      error: "Order not found.",
    };
  }

  const currentStatus = String(order.status ?? "");
  const fulfillmentMethod = String(order.fulfillment_method ?? "");

  // =================================================
  // TRANSITION VALIDATION (fulfillment-aware)
  // =================================================

  if (
    !canTransitionOrderStatus(
      currentStatus,
      targetStatus,
      fulfillmentMethod,
    )
  ) {
    return {
      success: false,
      error: "This status transition is not allowed.",
    };
  }

  // =================================================
  // CONDITIONAL UPDATE
  // =================================================

  try {
    const updated = await updateOrderStatusRecord(supabase, {
      orderId: order.id,
      expectedStatus: currentStatus,
      nextStatus: targetStatus,
    });

    if (!updated) {
      return {
        success: false,
        error: "Order status changed. Refresh and try again.",
      };
    }

    // =================================================
    // CACHE
    // =================================================

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);

    return {
      success: true,
      status: updated.status,
    };
  } catch (error) {
    console.error("Failed to update order status:", error);

    return {
      success: false,
      error:
        error instanceof Error && error.message.trim()
          ? error.message
          : "Unable to update order status.",
    };
  }
}
