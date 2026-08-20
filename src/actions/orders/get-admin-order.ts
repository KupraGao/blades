"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { loadOrderById } from "@/lib/orders/load-order-by-id";

// =================================================
// GET ADMIN ORDER
// =================================================
// requireAdmin() BEFORE privileged read.
// May read any order. Not for guest success / customers.
// =================================================

export async function getAdminOrder(id: string) {
  await requireAdmin();

  return loadOrderById(id);
}
