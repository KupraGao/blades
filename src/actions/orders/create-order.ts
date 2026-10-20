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
import { initiateOnlineBogPayment } from "@/lib/orders/initiate-online-bog-payment";
import { orderError } from "@/lib/i18n/localize-storefront-message";
import {
  assertOrderAccessSecretConfigured,
  issueOrderAccessProof,
} from "@/lib/orders/order-access-proof";
import { readBankPaymentRedirectUrl } from "@/lib/payments/bog/payment-redirect";
import { getAuthUser } from "@/lib/auth/get-auth-user";

// =================================================
// CREATE ORDER
// =================================================

type CreateOrderResult = {
  success: true;
  orderId: string;
  paymentRedirectUrl?: string;
};

export async function createOrder(
  order: CreateOrderInput,
  idempotencyKey: string,
): Promise<CreateOrderResult> {
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

  if (order.paymentMethod === "online") {
    const payment = await initiateOnlineBogPayment(orderId);
    const paymentRedirectUrl = readBankPaymentRedirectUrl(
      payment.redirectUrl,
    );

    if (!paymentRedirectUrl) {
      throw orderError("orderErrorPaymentStartFailed");
    }

    return {
      success: true,
      orderId,
      paymentRedirectUrl,
    };
  }

  return {
    success: true,
    orderId,
  };
}
