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
  const {
    cartItems,
    cartCount,
    selectedCartTotal,
    selectedItems,
    allItemsSelected,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    toggleItemSelected,
    setAllSelected,
  } = useCart();
  const { t } = useLanguage();

  const hasSelection = selectedItems.length > 0;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >

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

          <button
            type="button"
            aria-label={t.cart}
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

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
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={allItemsSelected}
                  onChange={(event) => setAllSelected(event.target.checked)}
                  className="h-4 w-4 accent-brand-orange"
                />
                {t.selectAllCartItems}
              </label>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative flex gap-3 rounded-2xl border p-3 dark:border-white/10 ${
                    item.selected
                      ? "border-zinc-200"
                      : "border-zinc-200 opacity-70"
                  }`}
                >
                  <Link
                    href={`/products/${item.id}`}
                    onClick={() => setOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-24 rounded-xl object-cover transition duration-300 hover:opacity-80"
                    />
                  </Link>

                  <div className="min-w-0 flex-1 pr-10">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={() => setOpen(false)}
                      className="block truncate font-semibold text-zinc-900 transition hover:text-brand-gold dark:text-white"
                    >
                      {item.title}
                    </Link>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {t.unitPrice}:{" "}
                      <span className="font-bold text-brand-gold">
                        ₾{item.price}
                      </span>
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      {t.total}: ₾{item.price * item.quantity}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={t.decreaseQuantity}
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity === 1}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="min-w-8 text-center text-sm font-bold text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={t.increaseQuantity}
                        onClick={() => increaseQuantity(item.id)}
                        disabled={item.quantity >= item.stock}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={t.removeProduct}
                    title={t.removeProduct}
                    onClick={() => removeFromCart(item.id)}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={17} />
                  </button>

                  <label className="absolute bottom-3 right-3 grid h-8 w-8 cursor-pointer place-items-center rounded-lg transition hover:bg-zinc-100 dark:hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelected(item.id)}
                      aria-label={item.title}
                      className="h-4 w-4 accent-brand-orange"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-zinc-200 p-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-zinc-600 dark:text-zinc-300">
                {t.selectedCartItemsLabel}
              </span>

              <span className="text-2xl font-black text-brand-gold">
                ₾{selectedCartTotal}
              </span>
            </div>

            {!hasSelection ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="status">
                {t.noCartItemsSelected}
              </p>
            ) : null}

            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-brand-orange px-6 py-4 font-bold text-white transition hover:opacity-90"
            >
              {t.viewCart}
            </Link>

            {hasSelection ? (
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                {t.checkout}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-3 flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-900 opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
              >
                {t.checkout}
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
