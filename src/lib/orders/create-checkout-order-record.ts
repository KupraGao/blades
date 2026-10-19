import { SupabaseClient } from "@supabase/supabase-js";

import { orderError } from "@/lib/i18n/localize-storefront-message";
import { assertCheckoutIdempotencyKey } from "@/lib/orders/checkout-idempotency-key";
import type {
  CreateOrderItemInput,
  FulfillmentMethod,
} from "@/lib/orders/validate-order";
import type { PaymentMethod } from "@/lib/orders/payment-rules";

export const CREATE_CHECKOUT_ORDER_RPC = "create_checkout_order";

const CHECKOUT_ERROR_MARKER = "checkout:";

type CheckoutOrderRpcInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string | null;
  customerNote?: string;
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  userId: string | null;
  items: CreateOrderItemInput[];
  idempotencyKey: string;
};

export function buildCreateCheckoutOrderArgs(
  input: CheckoutOrderRpcInput,
) {
  return {
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail ?? null,
    p_customer_address: input.customerAddress ?? null,
    p_customer_note: input.customerNote ?? null,
    p_fulfillment_method: input.fulfillmentMethod,
    p_payment_method: input.paymentMethod,
    p_user_id: input.userId,
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_idempotency_key: assertCheckoutIdempotencyKey(input.idempotencyKey),
  };
}

export function mapCreateCheckoutOrderRpcError(message: string): Error {
  const markerIndex = message.indexOf(CHECKOUT_ERROR_MARKER);
  if (markerIndex === -1) {
    return orderError("orderErrorSaveOrder");
  }

  const payload = message.slice(markerIndex + CHECKOUT_ERROR_MARKER.length);
  const lineBreak = payload.search(/\r|\n/);
  const firstLine = lineBreak === -1 ? payload : payload.slice(0, lineBreak);
  const [rawCode, ...rest] = firstLine.split("|");
  const code = rawCode.trim();
  const product = rest.join("|");

  switch (code) {
    case "invalid_fulfillment":
      return orderError("orderErrorFulfillmentInvalid");
    case "invalid_payment":
      return orderError("orderErrorPaymentMethodInvalid");
    case "invalid_payment_combination":
      return orderError("orderErrorPaymentCombinationInvalid");
    case "invalid_customer_name_required":
      return orderError("orderErrorCustomerNameRequired");
    case "invalid_customer_name_min":
      return orderError("orderErrorCustomerNameMin");
    case "invalid_phone_required":
      return orderError("orderErrorPhoneRequired");
    case "invalid_phone":
      return orderError("orderErrorPhoneInvalid");
    case "invalid_email":
      return orderError("orderErrorEmailInvalid");
    case "invalid_address_required":
      return orderError("orderErrorAddressRequired");
    case "invalid_address_min":
      return orderError("orderErrorAddressMin");
    case "empty_cart":
      return orderError("orderErrorCartEmpty");
    case "invalid_product_id":
      return orderError("orderErrorProductIdRequired");
    case "invalid_quantity":
      return orderError("orderErrorQuantityInvalid");
    case "products_not_found":
      return orderError("orderErrorProductsNotFound");
    case "invalid_price":
      return orderError("orderErrorInvalidPrice", product);
    case "null_stock":
    case "insufficient_stock":
      return orderError("orderErrorInsufficientStock", product);
    case "empty_title":
      return orderError("orderErrorProductTitleRequired");
    case "delivery_minimum":
      return orderError("orderErrorDeliveryMinimum");
    case "stock_update_failed":
      return orderError("orderErrorUpdateStock");
    case "idempotency_conflict":
      return orderError("orderErrorIdempotencyConflict");
    case "invalid_idempotency_key":
      return orderError("orderErrorInvalidIdempotencyKey");
    default:
      return orderError("orderErrorSaveOrder");
  }
}

function readCreatedOrderId(data: unknown): string {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw orderError("orderErrorSaveOrder");
  }

  const result = data as {
    success?: unknown;
    order_id?: unknown;
  };

  if (
    result.success !== true ||
    typeof result.order_id !== "string" ||
    result.order_id.length === 0
  ) {
    throw orderError("orderErrorSaveOrder");
  }

  return result.order_id;
}

export async function createCheckoutOrderRecord(
  supabase: SupabaseClient,
  input: CheckoutOrderRpcInput,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    CREATE_CHECKOUT_ORDER_RPC,
    buildCreateCheckoutOrderArgs(input),
  );

  if (error) {
    console.error("=== SUPABASE CREATE CHECKOUT ORDER RPC ERROR ===");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    throw mapCreateCheckoutOrderRpcError(error.message);
  }

  return readCreatedOrderId(data);
}
