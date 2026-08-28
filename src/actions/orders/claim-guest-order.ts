"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { loadOrderById } from "@/lib/orders/load-order-by-id";
import { verifyOrderAccessProof } from "@/lib/orders/order-access-proof";
import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// CLAIM GUEST ORDER (S6C Step 2)
// =================================================
// Requires authenticated Customer + valid order-access
// proof for this exact orderId. Never trusts client
// user_id. Never authorizes by email alone.
// =================================================

export type ClaimGuestOrderResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: "unauthorized" | "forbidden" | "failed";
    };

export async function claimGuestOrder(
  orderId: string,
): Promise<ClaimGuestOrderResult> {
  const trimmedId = typeof orderId === "string" ? orderId.trim() : "";

  if (!trimmedId) {
    return {
      success: false,
      error: "forbidden",
    };
  }

  const user = await getAuthUser();

  if (!user) {
    return {
      success: false,
      error: "unauthorized",
    };
  }

  const allowed = await verifyOrderAccessProof(trimmedId);

  if (!allowed) {
    return {
      success: false,
      error: "forbidden",
    };
  }

  const supabase = createAdminClient();

  const { data: claimedRows, error: claimError } = await supabase
    .from("orders")
    .update({
      user_id: user.id,
    })
    .eq("id", trimmedId)
    .is("user_id", null)
    .select("id");

  if (claimError) {
    console.error("claimGuestOrder update failed", {
      code: claimError.code ?? null,
    });

    return {
      success: false,
      error: "failed",
    };
  }

  if (claimedRows && claimedRows.length > 0) {
    return {
      success: true,
    };
  }

  const order = await loadOrderById(trimmedId);

  if (!order) {
    return {
      success: false,
      error: "forbidden",
    };
  }

  if (order.user_id === user.id) {
    return {
      success: true,
    };
  }

  return {
    success: false,
    error: "forbidden",
  };
}
