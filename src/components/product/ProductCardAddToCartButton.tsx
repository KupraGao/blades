"use client";

import { ShoppingBag } from "lucide-react";

import { AddToCartFloatFeedback } from "@/components/product/AddToCartFloatFeedback";
import { useAddToCartFloatFeedback } from "@/components/product/use-add-to-cart-float-feedback";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

type ProductCardAddToCartButtonProps = {
  product: any;
};

export function ProductCardAddToCartButton({
  product,
}: ProductCardAddToCartButtonProps) {
  const { t } = useLanguage();
  const { addToCart, cartItems } = useCart();
  const floatFeedback = useAddToCartFloatFeedback();

  const stock = Number(product.stock) || 0;
  const cartQuantity =
    cartItems.find((item) => item.id === product.id)?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isStockLimitReached = stock > 0 && cartQuantity >= stock;
  const disabled = isOutOfStock || isStockLimitReached;

  const label = isOutOfStock
    ? t.addToCartOutOfStock
    : isStockLimitReached
      ? t.stockLimitReached
      : t.addToCart;

  return (
    <div className="relative shrink-0">
      <AddToCartFloatFeedback
        count={floatFeedback.count}
        visible={floatFeedback.visible}
        exiting={floatFeedback.exiting}
        className="bottom-full right-0 mb-2"
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const result = addToCart(product);
          if (result.success) {
            floatFeedback.notifyAdded();
          }
        }}
        className="flex h-10 w-10 max-w-full shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-black text-white transition-all duration-300 hover:scale-105 hover:bg-brand-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-zinc-900 md:h-auto md:w-auto md:max-w-full md:px-3 md:py-2 lg:px-4 dark:bg-white dark:text-black dark:hover:bg-brand-gold dark:hover:text-black dark:disabled:hover:bg-white"
      >
        <ShoppingBag size={16} className="shrink-0" />
        <span className="hidden min-w-0 truncate md:inline">{label}</span>
      </button>
    </div>
  );
}
