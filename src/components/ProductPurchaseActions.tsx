"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import ProductDetailsContent from "@/components/ProductDetailsContent";

type ProductPurchaseActionsProps = {
  product: any;
};

export default function ProductPurchaseActions({ product }: ProductPurchaseActionsProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // =====================================
  // DECREASE
  // =====================================
  function decrease() {
    if (quantity > 1) setQuantity(quantity - 1);
  }

  // =====================================
  // INCREASE
  // =====================================
  function increase() {
    if (quantity < product.stock) setQuantity(quantity + 1);
  }

  // =====================================
  // ADD TO CART
  // =====================================
  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) addToCart(product);
  }

  return (
    <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      {/* QUANTITY */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium"><ProductDetailsContent label="quantity" /></span>

        <div className="flex items-center overflow-hidden rounded-2xl border border-zinc-300 dark:border-zinc-700">
          <button type="button" aria-label="რაოდენობის შემცირება" onClick={decrease} disabled={quantity === 1} className="px-4 py-2 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10">-</button>
          <span className="min-w-12 px-5 text-center">{quantity}</span>
          <button type="button" aria-label="რაოდენობის გაზრდა" onClick={increase} disabled={quantity >= product.stock} className="px-4 py-2 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10">+</button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex gap-4">
        <button type="button" disabled={product.stock <= 0} onClick={handleAddToCart} className="flex-1 rounded-2xl bg-zinc-900 px-6 py-4 font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black">
          <ProductDetailsContent label="addToCart" />
        </button>

        <button type="button" aria-label="Add to wishlist" title="Add to wishlist" className="rounded-2xl border border-zinc-300 px-6 py-4 transition hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-white/10">♡</button>
      </div>
    </div>
  );
}