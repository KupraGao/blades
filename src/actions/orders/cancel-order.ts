"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { canCancelOrderStatus } from "@/lib/orders/order-status";

// =================================================
// CANCEL ORDER
// =================================================

export type CancelOrderResult =
  | {
      success: true;
      status: string;
      alreadyCancelled: boolean;
    }
  | {
      success: false;
      error: string;
    };

type CancelOrderRpcResult = {
  success?: boolean;
  order_id?: string;
  status?: string;
  already_cancelled?: boolean;
};

function mapCancelOrderError(error: {
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

  if (haystack.includes("ORDER_NOT_CANCELLABLE")) {
    return "ამ სტატუსის შეკვეთის გაუქმება შეუძლებელია.";
  }

  if (haystack.includes("ORDER_STATUS_CONFLICT")) {
    return "შეკვეთის სტატუსი შეიცვალა. განაახლეთ გვერდი და სცადეთ თავიდან.";
  }

  return "შეკვეთის გაუქმება ვერ მოხერხდა.";
}

export async function cancelOrder(
  orderId: string,
): Promise<CancelOrderResult> {
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
    .select("id, status")
    .eq("id", normalizedOrderId)
    .maybeSingle();

  if (loadError) {
    console.error("=== SUPABASE CANCEL ORDER LOAD ERROR ===");
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

  if (currentStatus === "cancelled") {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);

    return {
      success: true,
      status: "cancelled",
      alreadyCancelled: true,
    };
  }

  if (!canCancelOrderStatus(currentStatus)) {
    return {
      success: false,
      error: "ამ სტატუსის შეკვეთის გაუქმება შეუძლებელია.",
    };
  }

  // =================================================
  // TRANSACTIONAL RPC (status + stock)
  // =================================================

  const { data, error } = await supabase.rpc("cancel_order", {
    p_order_id: order.id,
  });

  if (error) {
    console.error("=== SUPABASE CANCEL ORDER RPC ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);

    return {
      success: false,
      error: mapCancelOrderError(error),
    };
  }

  const result = data as CancelOrderRpcResult | null;

  if (!result?.success || result.status !== "cancelled") {
    console.error("=== SUPABASE CANCEL ORDER RPC INVALID RESULT ===");
    console.error("RESULT:", result);

    return {
      success: false,
      error: "შეკვეთის გაუქმება ვერ მოხერხდა.",
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
    alreadyCancelled: Boolean(result.already_cancelled),
  };
}
