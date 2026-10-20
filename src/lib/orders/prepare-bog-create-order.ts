import { createAdminClient } from "@/lib/supabase/admin";
import { assertBogServerOnly, getBogCallbackUrl } from "@/lib/payments/bog/config";
import { buildBogCheckoutReturnUrls } from "@/lib/payments/bog/return-urls";
import {
  assertIdempotencyKey,
  buildCreateOrderBody,
  createBogOrder,
  type BogCreateOrderBasketItem,
  type BogCreateOrderResult,
} from "@/lib/payments/bog/create-order";
import { BogError } from "@/lib/payments/bog/errors";

// Input accepted by createBogOrder. This helper does not call it.
type OnlineBogCreateOrderRequest = Parameters<typeof createBogOrder>[0];

function malformed(message: string): never {
  throw new BogError("malformed", message);
}

function readMoney(value: unknown, label: string): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  malformed(`Saved order ${label} is invalid.`);
}

function readQuantity(value: unknown): number {
  const quantity =
    typeof value === "number" ? value : Number(value);

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    malformed("Saved order item quantity is invalid.");
  }

  return quantity;
}

function readProductId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    malformed("Saved order item product_id is invalid.");
  }

  return value.trim();
}

/**
 * Builds the createBogOrder input from a stored online order.
 * Reads orders and order_items only. Does not call BOG and does not
 * change stock, order status, or payment status.
 */
export async function prepareOnlineBogCreateOrderInput(
  orderId: string,
): Promise<OnlineBogCreateOrderRequest> {
  assertBogServerOnly();
  const callbackUrl = getBogCallbackUrl();

  const requestedOrderId = orderId?.trim() ?? "";

  if (!requestedOrderId) {
    malformed("Saved order id is required.");
  }

  const supabase = createAdminClient();

  const { data: order, error: orderReadError } = await supabase
    .from("orders")
    .select("id, payment_method, total_price")
    .eq("id", requestedOrderId)
    .maybeSingle();

  if (orderReadError) {
    console.error("prepareOnlineBogCreateOrderInput order read error", {
      code: orderReadError.code ?? null,
    });
    throw new BogError("network", "Saved order could not be read.");
  }

  if (!order || typeof order.id !== "string" || !order.id.trim()) {
    malformed("Saved order was not found.");
  }

  if (order.payment_method !== "online") {
    malformed("BOG create-order is only available for online orders.");
  }

  const databaseOrderId = order.id.trim();

  const { data: items, error: itemsReadError } = await supabase
    .from("order_items")
    .select("product_id, product_title, product_price, quantity")
    .eq("order_id", databaseOrderId)
    .order("id", { ascending: true });

  if (itemsReadError) {
    console.error("prepareOnlineBogCreateOrderInput items read error", {
      code: itemsReadError.code ?? null,
    });
    throw new BogError("network", "Saved order items could not be read.");
  }

  if (!items || items.length === 0) {
    malformed("Saved order basket is required.");
  }

  const basket: BogCreateOrderBasketItem[] = items.map((item) => {
    const row: BogCreateOrderBasketItem = {
      product_id: readProductId(item.product_id),
      quantity: readQuantity(item.quantity),
      unit_price: readMoney(item.product_price, "product_price"),
    };

    if (typeof item.product_title === "string" && item.product_title.trim()) {
      row.description = item.product_title.trim();
    }

    return row;
  });

  const input: OnlineBogCreateOrderRequest = {
    callback_url: callbackUrl,
    external_order_id: databaseOrderId,
    idempotencyKey: databaseOrderId,
    capture: "automatic",
    redirect_urls: buildBogCheckoutReturnUrls(callbackUrl, databaseOrderId),
    purchase_units: {
      currency: "GEL",
      total_amount: readMoney(order.total_price, "total_price"),
      basket,
    },
  };

  assertIdempotencyKey(input.idempotencyKey);
  buildCreateOrderBody(input);

  return input;
}

/**
 * Calls the existing Create Order module for a stored online order.
 * Does not change stock, order status, or payment status.
 */
export async function createOnlineBogOrder(
  orderId: string,
): Promise<BogCreateOrderResult> {
  const input = await prepareOnlineBogCreateOrderInput(orderId);
  return createBogOrder(input);
}
