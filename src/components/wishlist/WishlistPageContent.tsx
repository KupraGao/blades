"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { AddToCartFloatFeedback } from "@/components/product/AddToCartFloatFeedback";
import { useAddToCartFloatFeedback } from "@/components/product/use-add-to-cart-float-feedback";

// =====================================
// WISHLIST ADD TO CART (local float feedback)
// =====================================
function WishlistAddToCartButton({ item }: { item: any }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const floatFeedback = useAddToCartFloatFeedback();

  return (
    <div className="relative min-w-0 flex-1">
      <AddToCartFloatFeedback
        count={floatFeedback.count}
        visible={floatFeedback.visible}
        exiting={floatFeedback.exiting}
        className="bottom-full left-1/2 mb-2 -translate-x-1/2"
      />
      <button
        type="button"
        disabled={item.stock <= 0}
        onClick={() => {
          addToCart(item);
          floatFeedback.notifyAdded();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-brand-gold"
      >
        <ShoppingBag size={17} />
        {t.addToCart}
      </button>
    </div>
  );
}

// =====================================
// WISHLIST PAGE CONTENT
// =====================================
export default function WishlistPageContent() {
  // =====================================
  // WISHLIST + LANGUAGE
  // =====================================
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const { t } = useLanguage();

  // =====================================
  // EMPTY WISHLIST
  // =====================================
  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-zinc-100 dark:bg-white/5">
          <Heart size={34} className="text-zinc-400" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {t.emptyWishlist}
        </h1>

        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          {t.emptyWishlistDescription}
        </p>

        <Link href="/" className="mt-6 rounded-2xl bg-brand-orange px-6 py-3 font-bold text-white transition hover:opacity-90">
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {t.wishlist}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.savedProducts}: {wishlistCount}
          </p>
        </div>

        <Heart size={28} className="text-brand-orange" fill="currentColor" />
      </div>

      {/* ===================================== */}
      {/* PRODUCTS */}
      {/* ===================================== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlistItems.map((item) => (
          <article key={item.id} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04]">
            {/* PRODUCT IMAGE */}
            <Link href={`/products/${item.id}`} className="relative block aspect-[5/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </Link>

            {/* PRODUCT CONTENT */}
            <div className="p-5">
              <Link href={`/products/${item.id}`} className="line-clamp-1 font-serif text-xl font-bold text-zinc-900 transition hover:text-brand-gold dark:text-white">
                {item.title}
              </Link>

              <p className="mt-3 text-lg font-black text-brand-gold">
                ₾{item.price}
              </p>

              {/* STOCK */}
              <div className="mt-2">
                {item.stock > 0 ? (
                  <span className="text-sm font-medium text-green-500">
                    {t.inStock} • {item.stock} {t.pieces}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-red-500">
                    {t.outOfStock}
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex gap-2">
                <WishlistAddToCartButton item={item} />

                <button
                  type="button"
                  aria-label={t.removeFromWishlist}
                  title={t.removeFromWishlist}
                  onClick={() => removeFromWishlist(item.id)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-200 text-red-500 transition hover:border-red-500/30 hover:bg-red-500/10 dark:border-white/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}