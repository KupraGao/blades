"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

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
import {
  assertOrderAccessSecretConfigured,
  issueOrderAccessProof,
} from "@/lib/orders/order-access-proof";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { isDeliverySubtotalAllowed } from "@/lib/orders/delivery-rules";
import { orderError } from "@/lib/i18n/localize-storefront-message";

// =================================================
// CREATE ORDER
// =================================================

export async function createOrder(
  order: CreateOrderInput,
) {
  // Fail closed before writes if guest success proof cannot be issued.
  assertOrderAccessSecretConfigured();

  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

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
  // DELIVERY MINIMUM (authoritative resolved subtotal)
  // =================================================

  const authoritativeSubtotal = resolvedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (
    order.fulfillmentMethod === "delivery" &&
    !isDeliverySubtotalAllowed(authoritativeSubtotal)
  ) {
    throw orderError("orderErrorDeliveryMinimum");
  }

  // =================================================
  // OWNERSHIP (S6E — server session only)
  // =================================================
  // Never from CreateOrderInput / client payload.
  // =================================================

  const authUser = await getAuthUser();
  const ownerUserId = authUser?.id ?? null;

  // =================================================
  // ORDER
  // =================================================

  const orderData = orderMapper(
    order,
    resolvedItems,
    ownerUserId,
  );

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
  if (ownerUserId) {
    revalidatePath("/account");
  }

  // =================================================
  // GUEST SUCCESS ACCESS PROOF (S6C Step 1)
  // =================================================
  // Issued only after successful order + items + stock.
  // UUID alone must not authorize success PII.
  // =================================================

  await issueOrderAccessProof(orderId);

  // =================================================
  // RESULT
  // =================================================

  return {
    success: true,
    orderId,
  };
}
