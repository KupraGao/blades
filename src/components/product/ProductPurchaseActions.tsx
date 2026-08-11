"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";

import ProductDetailsContent from "@/components/product/ProductDetailsContent";

type ProductPurchaseActionsProps = {
  product: any;
};

export default function ProductPurchaseActions({
  product,
}: ProductPurchaseActionsProps) {

  // =====================================
  // CART + WISHLIST
  // =====================================

  const { addToCart } = useCart();
  const { t } = useLanguage();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  // =====================================
  // QUANTITY
  // =====================================

  const [quantity, setQuantity] = useState(1);

  // =====================================
  // PRODUCT DATA
  // =====================================

  const stock = Number(product.stock) || 0;

  const liked = isInWishlist(product.id);

  // =====================================
  // DECREASE
  // =====================================

  function decrease() {
    if (quantity <= 1) return;

    setQuantity((current) => current - 1);
  }

  // =====================================
  // INCREASE
  // =====================================

  function increase() {
    if (quantity >= stock) return;

    setQuantity((current) => current + 1);
  }

  // =====================================
  // ADD TO CART
  // =====================================

  function handleAddToCart() {
    if (stock <= 0) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">

      {/* ===================================== */}
      {/* QUANTITY */}
      {/* ===================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 p-5 dark:border-white/10">

        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            <ProductDetailsContent label="quantity" />
          </p>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t.maxQuantity.replace("{count}", String(stock))}
          </p>
        </div>

        <div className="flex items-center overflow-hidden rounded-xl border border-zinc-300 bg-white dark:border-white/10 dark:bg-black/30">

          {/* MINUS */}

          <button
            type="button"
            aria-label={t.decreaseQuantity}
            onClick={decrease}
            disabled={quantity <= 1}
            className="grid h-11 w-11 place-items-center transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
          >
            <Minus size={17} />
          </button>

          {/* QUANTITY */}

          <span className="grid h-11 min-w-12 place-items-center border-x border-zinc-300 px-3 text-sm font-bold dark:border-white/10">
            {quantity}
          </span>

          {/* PLUS */}

          <button
            type="button"
            aria-label={t.increaseQuantity}
            onClick={increase}
            disabled={quantity >= stock}
            className="grid h-11 w-11 place-items-center transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
          >
            <Plus size={17} />
          </button>

        </div>

      </div>

      {/* ===================================== */}
      {/* ACTIONS */}
      {/* ===================================== */}

      <div className="flex gap-3 p-5">

        {/* ===================================== */}
        {/* ADD TO CART */}
        {/* ===================================== */}

        <button
          type="button"
          disabled={stock <= 0}
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-4 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag size={19} />

          <ProductDetailsContent label="addToCart" />
        </button>

        {/* ===================================== */}
        {/* WISHLIST */}
        {/* ===================================== */}

        <button
          type="button"
          aria-label={
            liked
              ? t.removeFromWishlist
              : t.addToWishlist
          }
          title={
            liked
              ? t.removeFromWishlist
              : t.addToWishlist
          }
          onClick={() => toggleWishlist(product)}
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border transition ${
            liked
              ? "border-brand-orange bg-brand-orange text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-brand-orange hover:text-brand-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
          }`}
        >
          <Heart
            size={21}
            fill={liked ? "currentColor" : "none"}
          />
        </button>

      </div>

    </div>
  );
}