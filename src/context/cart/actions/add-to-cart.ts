import {
  getEffectiveProductPrice,
  getRegularProductPrice,
  isProductOnSale,
} from "@/lib/products/pricing";
import type { AddToCartResult, CartItem } from "../types";

type AddToCartParams = {
  currentItems: CartItem[];
  product: any;
};

export function addToCart({
  currentItems,
  product,
}: AddToCartParams): { items: CartItem[]; result: AddToCartResult } {
  const existingItem = currentItems.find((item) => item.id === product.id);

  const productStock = Number(product.stock) || 0;

  if (productStock <= 0) {
    return {
      items: currentItems,
      result: { success: false, reason: "out_of_stock" },
    };
  }

  if (existingItem) {
    if (existingItem.quantity >= productStock) {
      return {
        items: currentItems,
        result: { success: false, reason: "stock_limit" },
      };
    }

    return {
      items: currentItems.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              stock: productStock,
            }
          : item,
      ),
      result: { success: true },
    };
  }

  const defaultImage =
    product.product_images?.find((img: any) => img.is_main) ||
    product.product_images?.[0];

  const productImage =
    product.image || defaultImage?.image_url || "/placeholder.png";

  return {
    items: [
      ...currentItems,
      {
        id: product.id,
        title: product.title,
        price: getEffectiveProductPrice(product),
        regularPrice: getRegularProductPrice(product),
        salePrice: isProductOnSale(product)
          ? getEffectiveProductPrice(product)
          : null,
        image: productImage,
        quantity: 1,
        stock: productStock,
        selected: true,
      },
    ],
    result: { success: true },
  };
}
