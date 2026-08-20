"use server";

import { verifyOrderAccessProof } from "@/lib/orders/order-access-proof";
import { loadOrderById } from "@/lib/orders/load-order-by-id";

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

  return loadOrderById(id);
}
