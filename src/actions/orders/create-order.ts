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
import { releaseUnsentOnlineOrder } from "@/lib/orders/release-unsent-online-order";
import { readBankOrderDispatch } from "@/lib/payments/bog/bank-order-dispatch";
import {
  assertOrderAccessSecretConfigured,
  issueOrderAccessProof,
} from "@/lib/orders/order-access-proof";
import { readBankPaymentRedirectUrl } from "@/lib/payments/bog/payment-redirect";
import { getAuthUser } from "@/lib/auth/get-auth-user";

// =================================================
// CREATE ORDER
// =================================================

const PAYMENT_NOT_STARTED_MESSAGE_CODES = [
  "orderErrorPaymentStartFailed",
  "orderErrorPaymentAttachFailed",
  "orderErrorPaymentAlreadyStarted",
  "orderErrorPaymentConflict",
  "orderErrorPaymentUnavailable",
] as const;

export type PaymentNotStartedMessageCode =
  | (typeof PAYMENT_NOT_STARTED_MESSAGE_CODES)[number]
  | "orderErrorPaymentStartReleased";

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      paymentRedirectUrl?: string;
    }
  | {
      success: false;
      reason: "payment_not_started";
      messageCode: PaymentNotStartedMessageCode;
      stockReleased: boolean;
    };

function readPaymentNotStartedMessageCode(
  error: unknown,
): PaymentNotStartedMessageCode | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const code = error.message.split("|")[0];

  if ((PAYMENT_NOT_STARTED_MESSAGE_CODES as readonly string[]).includes(code)) {
    return code as PaymentNotStartedMessageCode;
  }

  return null;
}

function paymentNotStarted(
  messageCode: PaymentNotStartedMessageCode,
  stockReleased = false,
): CreateOrderResult {
  return {
    success: false,
    reason: "payment_not_started",
    messageCode,
    stockReleased,
  };
}

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
    try {
      const payment = await initiateOnlineBogPayment(orderId);
      const paymentRedirectUrl = readBankPaymentRedirectUrl(
        payment.redirectUrl,
      );

      if (!paymentRedirectUrl) {
        return paymentNotStarted("orderErrorPaymentStartFailed");
      }

      return {
        success: true,
        orderId,
        paymentRedirectUrl,
      };
    } catch (error) {
      const messageCode = readPaymentNotStartedMessageCode(error);

      if (!messageCode) {
        throw error;
      }

      const stockReleased =
        readBankOrderDispatch(error) === "unsent"
          ? await releaseUnsentOnlineOrder(orderId)
          : false;

      return paymentNotStarted(
        stockReleased ? "orderErrorPaymentStartReleased" : messageCode,
        stockReleased,
      );
    }
  }

  return {
    success: true,
    orderId,
  };
}
