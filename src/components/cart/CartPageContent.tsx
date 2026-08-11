"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CartPageContent() {
  const { cartItems, cartCount, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();

  // =====================================
  // EMPTY CART
  // =====================================
  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-zinc-100 dark:bg-white/5">
          <ShoppingBag size={34} className="text-zinc-400" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t.emptyCart}</h1>

        <p className="mt-3 text-zinc-500 dark:text-zinc-400">{t.emptyCartDescription}</p>

        <Link href="/" className="mt-6 rounded-2xl bg-brand-orange px-6 py-3 font-bold text-white transition hover:opacity-90">
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

      {/* ===================================== */}
      {/* CART PRODUCTS */}
      {/* ===================================== */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t.cart}</h1>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{cartCount} {t.products}</span>
        </div>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">

              {/* PRODUCT IMAGE */}
              <Link
                href={`/products/${item.id}`}
                className="shrink-0 overflow-hidden rounded-xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-28 w-28 rounded-xl object-cover transition duration-300 hover:scale-105"
                />
              </Link>

              {/* PRODUCT INFO */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.id}`} className="font-bold text-zinc-900 transition hover:text-brand-gold dark:text-white">
                      {item.title}
                    </Link>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {t.unitPrice}: <span className="font-bold text-brand-gold">₾{item.price}</span>
                    </p>
                  </div>

                  <button type="button" aria-label={t.removeProduct} title={t.removeProduct} onClick={() => removeFromCart(item.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-500 transition hover:bg-red-500/10">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">

                  {/* QUANTITY */}
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={t.decreaseQuantity} onClick={() => decreaseQuantity(item.id)} disabled={item.quantity === 1} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10">
                      <Minus size={16} />
                    </button>

                    <span className="min-w-10 text-center font-bold">{item.quantity}</span>

                    <button type="button" aria-label={t.increaseQuantity} onClick={() => increaseQuantity(item.id)} disabled={item.quantity >= item.stock} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10">
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* PRODUCT TOTAL */}
                  <p className="text-lg font-black text-zinc-900 dark:text-white">
                    ₾{item.price * item.quantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================== */}
      {/* ORDER SUMMARY */}
      {/* ===================================== */}
      <aside className="h-fit rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t.orderSummary}</h2>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
            <span>{t.products}</span>
            <span>{cartCount}</span>
          </div>

          <div className="flex justify-between border-t border-zinc-200 pt-4 dark:border-white/10">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">{t.total}</span>
            <span className="text-2xl font-black text-brand-gold">₾{cartTotal}</span>
          </div>
        </div>

        <Link href="/checkout" className="mt-6 block w-full rounded-2xl bg-brand-orange px-6 py-4 text-center font-bold text-white transition hover:opacity-90">
          {t.checkout}
        </Link>

        <Link href="/" className="mt-3 block text-center text-sm font-semibold text-zinc-500 transition hover:text-brand-gold">
          {t.continueShopping}
        </Link>
      </aside>
    </div>
  );
}