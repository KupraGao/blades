"use client";

import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

type CartDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function CartDrawer({ open, setOpen }: CartDrawerProps) {
  const { cartItems, cartCount } = useCart();

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
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">კალათა</h2>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-orange px-1.5 text-xs font-bold text-white">{cartCount}</span>
          </div>
          <button type="button" aria-label="კალათის დახურვა" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* ===================================== */}
        {/* CONTENT */}
        {/* ===================================== */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            /* EMPTY CART */
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-zinc-100 dark:bg-white/5">
                <ShoppingBag size={28} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">კალათა ცარიელია</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">კალათაში ჯერ პროდუქტი არ დაგიმატებია.</p>
            </div>
          ) : (
            /* CART ITEMS */
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-zinc-200 p-3 dark:border-white/10">
                  <img src={item.image} alt={item.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">რაოდენობა: {item.quantity}</p>
                    <p className="mt-2 font-black text-brand-gold">₾{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}