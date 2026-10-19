"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  CreateOrderInput,
  consolidateOrderItems,
  validateOrder,
} from "@/lib/orders/validate-order";
import { assertCheckoutIdempotencyKey } from "@/lib/orders/checkout-idempotency-key";
import { createCheckoutOrderRecord } from "@/lib/orders/create-checkout-order-record";
import {
  assertOrderAccessSecretConfigured,
  issueOrderAccessProof,
} from "@/lib/orders/order-access-proof";
import { getAuthUser } from "@/lib/auth/get-auth-user";

// =================================================
// CREATE ORDER
// =================================================

export async function createOrder(
  order: CreateOrderInput,
  idempotencyKey: string,
) {
  // Fail closed before writes if guest success proof cannot be issued.
  assertOrderAccessSecretConfigured();

  validateOrder(order);
  const checkoutIdempotencyKey = assertCheckoutIdempotencyKey(idempotencyKey);

  const supabase = createAdminClient();

  const consolidatedItems = consolidateOrderItems(
    order.items,
  );

  // Never from CreateOrderInput. Guest → null; customer → session id.
  const authUser = await getAuthUser();
  const ownerUserId = authUser?.id ?? null;

  const orderId = await createCheckoutOrderRecord(supabase, {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    customerAddress: order.customerAddress,
    customerNote: order.customerNote,
    fulfillmentMethod: order.fulfillmentMethod,
    paymentMethod: order.paymentMethod,
    userId: ownerUserId,
    items: consolidatedItems,
    idempotencyKey: checkoutIdempotencyKey,
  });

  revalidatePath("/admin/orders");
  if (ownerUserId) {
    revalidatePath("/account");
  }

  // Issued only after the transactional RPC succeeds.
  // UUID alone must not authorize success PII.
  await issueOrderAccessProof(orderId);

  return {
    success: true,
    orderId,
  };
}
