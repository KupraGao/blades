import { SupabaseClient } from "@supabase/supabase-js";

import { orderError } from "@/lib/i18n/localize-storefront-message";
import {
  CreateOrderItemInput,
  ResolvedOrderItem,
} from "./validate-order";

// =================================================
// RESOLVE ORDER ITEMS FROM DATABASE
// =================================================

export async function resolveOrderItems(
  supabase: SupabaseClient,
  items: CreateOrderItemInput[],
): Promise<ResolvedOrderItem[]> {
  const productIds = items.map((item) => item.productId);

  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, stock")
    .in("id", productIds);

  if (error) {
    throw orderError("orderErrorFetchProducts");
  }

  const products = data ?? [];

  if (products.length !== productIds.length) {
    throw orderError("orderErrorProductsNotFound");
  }

  const productsById = new Map(
    products.map((product) => [product.id as string, product]),
  );

  return items.map((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      throw orderError("orderErrorProductsNotFound");
    }

    const price = Number(product.price);
    const stock = Number(product.stock);
    const productLabel = String(product.title ?? "");

    if (!Number.isFinite(price) || price < 0) {
      throw orderError("orderErrorInvalidPrice", productLabel);
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw orderError("orderErrorInvalidStock", productLabel);
    }

    if (item.quantity > stock) {
      throw orderError("orderErrorInsufficientStock", productLabel);
    }

    const title = String(product.title ?? "").trim();

    if (!title) {
      throw orderError("orderErrorProductTitleRequired");
    }

    return {
      productId: item.productId,
      title,
      price,
      quantity: item.quantity,
      stock,
    };
  });
}
