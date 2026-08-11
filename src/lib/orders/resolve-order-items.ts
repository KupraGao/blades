import { SupabaseClient } from "@supabase/supabase-js";

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
    throw new Error("პროდუქტების წამოღება ვერ მოხერხდა.");
  }

  const products = data ?? [];

  if (products.length !== productIds.length) {
    throw new Error("ერთი ან რამდენიმე პროდუქტი ვერ მოიძებნა.");
  }

  const productsById = new Map(
    products.map((product) => [product.id as string, product]),
  );

  return items.map((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      throw new Error("ერთი ან რამდენიმე პროდუქტი ვერ მოიძებნა.");
    }

    const price = Number(product.price);
    const stock = Number(product.stock);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        `პროდუქტის ფასი არასწორია: ${product.title || "უცნობი პროდუქტი"}.`,
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error(
        `პროდუქტის მარაგი არასწორია: ${product.title || "უცნობი პროდუქტი"}.`,
      );
    }

    if (item.quantity > stock) {
      throw new Error(
        `მარაგი არასაკმარისია: ${product.title || "უცნობი პროდუქტი"}.`,
      );
    }

    const title = String(product.title ?? "").trim();

    if (!title) {
      throw new Error("პროდუქტის დასახელება აუცილებელია.");
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
