"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  canChangeOrderFulfillment,
  isOrderFulfillmentMethod,
} from "@/lib/orders/order-status";
import { updateOrderFulfillmentRecord } from "@/lib/orders/update-order-fulfillment-record";
import type { FulfillmentMethod } from "@/lib/orders/validate-order";

// =================================================
// UPDATE ORDER FULFILLMENT
// =================================================

export type UpdateOrderFulfillmentResult =
  | {
      success: true;
      fulfillmentMethod: FulfillmentMethod;
      status: string;
    }
  | {
      success: false;
      error: string;
    };

const MIN_ADDRESS_LENGTH = 5;

export async function updateOrderFulfillment(
  orderId: string,
  targetFulfillment: string,
  customerAddress?: string | null,
): Promise<UpdateOrderFulfillmentResult> {
  // =================================================
  // INPUT VALIDATION
  // =================================================

  if (!orderId || !orderId.trim()) {
    return {
      success: false,
      error: "Order ID is required.",
    };
  }

  if (!isOrderFulfillmentMethod(targetFulfillment)) {
    return {
      success: false,
      error: "Invalid fulfillment method.",
    };
  }

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // LOAD AUTHORITATIVE ORDER
  // =================================================

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, fulfillment_method")
    .eq("id", orderId.trim())
    .maybeSingle();

  if (error) {
    console.error("=== SUPABASE ORDER FULFILLMENT LOAD ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);

    return {
      success: false,
      error: "Unable to load order.",
    };
  }

  if (!order) {
    return {
      success: false,
      error: "Order not found.",
    };
  }

  const currentStatus = String(order.status ?? "");
  const currentFulfillment = String(order.fulfillment_method ?? "");

  if (!canChangeOrderFulfillment(currentStatus)) {
    return {
      success: false,
      error: "Fulfillment cannot be changed for this order status.",
    };
  }

  if (!isOrderFulfillmentMethod(currentFulfillment)) {
    return {
      success: false,
      error: "Invalid current fulfillment method.",
    };
  }

  if (currentFulfillment === targetFulfillment) {
    return {
      success: true,
      fulfillmentMethod: targetFulfillment,
      status: currentStatus,
    };
  }

  // =================================================
  // ADDRESS RULES
  // =================================================

  let nextAddress: string | null = null;

  if (targetFulfillment === "pickup") {
    nextAddress = null;
  } else {
    const trimmed = (customerAddress ?? "").trim();

    if (!trimmed) {
      return {
        success: false,
        error: "Delivery address is required.",
      };
    }

    if (trimmed.length < MIN_ADDRESS_LENGTH) {
      return {
        success: false,
        error: "Delivery address is too short.",
      };
    }

    nextAddress = trimmed;
  }

  // =================================================
  // CONDITIONAL UPDATE (status + fulfillment guarded)
  // =================================================

  try {
    const updated = await updateOrderFulfillmentRecord(supabase, {
      orderId: order.id,
      expectedStatus: currentStatus,
      expectedFulfillment: currentFulfillment,
      nextFulfillment: targetFulfillment,
      customerAddress: nextAddress,
    });

    if (!updated) {
      return {
        success: false,
        error: "Order changed. Refresh and try again.",
      };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);

    return {
      success: true,
      fulfillmentMethod: targetFulfillment,
      status: String(updated.status ?? currentStatus),
    };
  } catch (error) {
    console.error("Failed to update order fulfillment:", error);

    return {
      success: false,
      error:
        error instanceof Error && error.message.trim()
          ? error.message
          : "Unable to update order fulfillment.",
    };
  }
}
