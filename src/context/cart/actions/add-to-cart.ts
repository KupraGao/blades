import { CartItem } from "../types";

// =================================================
// ADD TO CART
// =================================================

type AddToCartParams = {
  currentItems: CartItem[];
  product: any;
};

export function addToCart({
  currentItems,
  product,
}: AddToCartParams): CartItem[] {

  const existingItem =
    currentItems.find(
      (item) => item.id === product.id
    );

  const productStock =
    Number(product.stock) || 0;

  // =====================================
  // OUT OF STOCK
  // =====================================

  if (productStock <= 0) {
    return currentItems;
  }

  // =====================================
  // PRODUCT ALREADY EXISTS
  // =====================================

  if (existingItem) {

    if (
      existingItem.quantity >= productStock
    ) {
      return currentItems;
    }

    return currentItems.map((item) =>
      item.id === product.id
        ? {
            ...item,
            quantity: item.quantity + 1,
            stock: productStock,
          }
        : item
    );
  }

  // =====================================
  // PRODUCT IMAGE
  // =====================================

  const defaultImage =
    product.product_images?.find(
      (img: any) => img.is_main
    ) ||
    product.product_images?.[0];

  const productImage =
    product.image ||
    defaultImage?.image_url ||
    "/placeholder.png";

  // =====================================
  // NEW CART ITEM
  // =====================================

  return [
    ...currentItems,
    {
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: productImage,
      quantity: 1,
      stock: productStock,
    },
  ];
}