"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

type CartDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function CartDrawer({ open, setOpen }: CartDrawerProps) {
  const { cartItems, cartCount, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();

  return (
    <>
      {/* ===================================== */}
      {/* OVERLAY */}
      {/* ===================================== */}
      <div onClick={() => setOpen(false)} className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`} />

      {/* ===================================== */}
      {/* CART DRAWER */}
      {/* ===================================== */}
      <aside className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}
        <div className="flex h-20 items-center justify-between border-b border-zinc-200 px-6 dark:border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} />

            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t.cart}
            </h2>

            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-orange px-1.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          </div>

          <button type="button" aria-label={t.cart} onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* ===================================== */}
        {/* CONTENT */}
        {/* ===================================== */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-zinc-100 dark:bg-white/5">
                <ShoppingBag size={28} className="text-zinc-400" />
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {t.emptyCart}
              </h3>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {t.emptyCartDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="relative flex gap-4 rounded-2xl border border-zinc-200 p-3 dark:border-white/10">

                  {/* PRODUCT IMAGE */}
                  <img src={item.image} alt={item.title} className="h-24 w-24 shrink-0 rounded-xl object-cover" />

                  {/* PRODUCT INFO */}
                  <div className="min-w-0 flex-1 pr-8">
                    <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
                      {item.title}
                    </h3>

                    {/* UNIT PRICE */}
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {t.unitPrice}: <span className="font-bold text-brand-gold">₾{item.price}</span>
                    </p>

                    {/* PRODUCT TOTAL */}
                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      {t.total}: ₾{item.price * item.quantity}
                    </p>

                    {/* ===================================== */}
                    {/* QUANTITY CONTROLS */}
                    {/* ===================================== */}
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" aria-label={t.decreaseQuantity} onClick={() => decreaseQuantity(item.id)} disabled={item.quantity === 1} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
                        <Minus size={15} />
                      </button>

                      <span className="min-w-8 text-center text-sm font-bold text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>

                      <button type="button" aria-label={t.increaseQuantity} onClick={() => increaseQuantity(item.id)} disabled={item.quantity >= item.stock} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* ===================================== */}
                  {/* REMOVE ITEM */}
                  {/* ===================================== */}
                  <button type="button" aria-label={t.removeProduct} title={t.removeProduct} onClick={() => removeFromCart(item.id)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-red-500 transition hover:bg-red-500/10">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===================================== */}
        {/* CART FOOTER */}
        {/* ===================================== */}
        {cartItems.length > 0 && (
          <div className="border-t border-zinc-200 p-6 dark:border-white/10">

            {/* TOTAL */}
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-zinc-600 dark:text-zinc-300">
                {t.total}
              </span>

              <span className="text-2xl font-black text-brand-gold">
                ₾{cartTotal}
              </span>
            </div>

            {/* ===================================== */}
            {/* VIEW CART */}
            {/* ===================================== */}
            <Link href="/cart" onClick={() => setOpen(false)} className="mt-5 flex w-full items-center justify-center rounded-2xl bg-brand-orange px-6 py-4 font-bold text-white transition hover:opacity-90">
              {t.viewCart}
            </Link>

          </div>
        )}
      </aside>
    </>
  );
}