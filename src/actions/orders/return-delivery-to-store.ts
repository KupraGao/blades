"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { canReturnDeliveryToStore } from "@/lib/orders/order-status";

// =================================================
// RETURN DELIVERY TO STORE
// =================================================

export type ReturnDeliveryToStoreResult =
  | {
      success: true;
      status: string;
      alreadyReturned: boolean;
    }
  | {
      success: false;
      error: string;
    };

type ReturnDeliveryToStoreRpcResult = {
  success?: boolean;
  order_id?: string;
  status?: string;
  already_returned?: boolean;
};

function mapReturnDeliveryToStoreError(error: {
  message?: string;
  code?: string;
  details?: string | null;
}): string {
  const haystack = [
    error.message,
    error.details,
    error.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  if (haystack.includes("ORDER_ID_REQUIRED")) {
    return "შეკვეთის ID აუცილებელია.";
  }

  if (haystack.includes("ORDER_NOT_FOUND")) {
    return "შეკვეთა ვერ მოიძებნა.";
  }

  if (haystack.includes("ORDER_NOT_RETURNABLE")) {
    return "ამ შეკვეთის საწყობში დაბრუნება შეუძლებელია.";
  }

  if (haystack.includes("ORDER_STATUS_CONFLICT")) {
    return "შეკვეთის სტატუსი შეიცვალა. განაახლეთ გვერდი და სცადეთ თავიდან.";
  }

  return "შეკვეთის საწყობში დაბრუნება ვერ მოხერხდა.";
}

export async function returnDeliveryToStore(
  orderId: string,
): Promise<ReturnDeliveryToStoreResult> {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    throw error;
  }

  // =================================================
  // INPUT VALIDATION
  // =================================================

  if (!orderId || !orderId.trim()) {
    return {
      success: false,
      error: "შეკვეთის ID აუცილებელია.",
    };
  }

  const normalizedOrderId = orderId.trim();

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  // =================================================
  // EARLY AUTHORITATIVE STATUS CHECK
  // =================================================

  const { data: order, error: loadError } = await supabase
    .from("orders")
    .select("id, status, fulfillment_method")
    .eq("id", normalizedOrderId)
    .maybeSingle();

  if (loadError) {
    console.error("=== SUPABASE RETURN TO STORE LOAD ERROR ===");
    console.error("CODE:", loadError.code);
    console.error("MESSAGE:", loadError.message);
    console.error("DETAILS:", loadError.details);
    console.error("HINT:", loadError.hint);

    return {
      success: false,
      error: "შეკვეთის სტატუსის წამოღება ვერ მოხერხდა.",
    };
  }

  if (!order) {
    return {
      success: false,
      error: "შეკვეთა ვერ მოიძებნა.",
    };
  }

  const currentStatus = String(order.status ?? "");
  const fulfillmentMethod = String(order.fulfillment_method ?? "");

  if (currentStatus === "returned_to_store") {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);

    return {
      success: true,
      status: "returned_to_store",
      alreadyReturned: true,
    };
  }

  if (!canReturnDeliveryToStore(currentStatus, fulfillmentMethod)) {
    return {
      success: false,
      error: "ამ შეკვეთის საწყობში დაბრუნება შეუძლებელია.",
    };
  }

  // =================================================
  // TRANSACTIONAL RPC (status + stock) — authoritative
  // =================================================

  const { data, error } = await supabase.rpc(
    "return_delivery_to_store",
    {
      p_order_id: order.id,
    },
  );

  if (error) {
    console.error("=== SUPABASE RETURN TO STORE RPC ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);

    return {
      success: false,
      error: mapReturnDeliveryToStoreError(error),
    };
  }

  const result = data as ReturnDeliveryToStoreRpcResult | null;

  if (!result?.success || result.status !== "returned_to_store") {
    console.error("=== SUPABASE RETURN TO STORE RPC INVALID RESULT ===");
    console.error("RESULT:", result);

    return {
      success: false,
      error: "შეკვეთის საწყობში დაბრუნება ვერ მოხერხდა.",
    };
  }

  // =================================================
  // CACHE
  // =================================================

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);

  return {
    success: true,
    status: result.status,
    alreadyReturned: Boolean(result.already_returned),
  };
}
