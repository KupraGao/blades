"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type ProductCardProps = {
  product: any;
};

export function ProductCard({ product }: ProductCardProps) {

  const { t } = useLanguage();

  const defaultImage =
    product.product_images?.find(
      (img: any) => img.is_main
    ) || product.product_images?.[0];

  const [activeImage, setActiveImage] =
    useState(
      defaultImage?.image_url ||
      "/placeholder.png"
    );

  const categories =
    product.product_categories?.map(
      (pc: any) => pc.categories?.name
    ) || [];

  return (
    <Link href={`/products/${product.id}`}>
      <article
       className=" group overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10
        dark:bg-white/[0.04] transition hover:border-brand-gold/50 dark:hover:bg-white/[0.06]">

        {/* ========================================= */}
        {/* IMAGE */}
        {/* ========================================= */}

        <div className=" relative aspect-[5/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900   "   >
          <img
            src={activeImage}
            alt={product.title}
            className=" absolute inset-0 h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"/>
          {/* OVERLAY */}
          <div className="  absolute inset-0  bg-gradient-to-t  from-black  via-black/10  to-transparent"/>

          {/* ========================================= */}
          {/* GALLERY PREVIEW */}
          {/* ========================================= */}

          <div className="  absolute left-4 bottom-4  flex gap-2  opacity-0  transition duration-300  group-hover:opacity-100">
            {product.product_images
              ?.slice(0, 3)
              .map((img: any) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt=""
                  onMouseEnter={() =>
                    setActiveImage(img.image_url)
                  }
                  className=" h-12 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-white object-cover shadow-md 
                  transition hover:scale-110 hover:border-brand-gold " />
              ))}
          </div>

          {/* WISHLIST */}

          <button type="button" aria-label="Add to wishlist" title="Add to wishlist"
            onClick={(e) => e.preventDefault()}
           className=" absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white/90
            text-zinc-900 dark:border-white/10 dark:bg-black/40 dark:text-white backdrop-blur transition hover:bg-brand-orange hover:text-white">
            <Heart size={18} />
          </button>
        </div>

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}
        
        <div className="p-5">
          {/* <p className=" text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            {categories.length
              ? categories.join(" • ")
              : "—"}
          </p> */}
          <h3 className=" mt-2 line-clamp-1 font-serif text-xl font-bold text-zinc-900 dark:text-white ">
            {product.title}
          </h3>
          {/* PRICE + ADD TO CART */}
          <div
            className=" mt-4 flex items-center justify-between gap-3 ">
            <span className=" text-lg font-black text-brand-gold"            >
              ₾{product.price}
            </span>
           <button type="button" aria-label="Add to cart" title="Add to cart" 
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center h-10 w-10 md:h-auto md:w-auto md:px-4 md:py-2 gap-2 rounded-full text-sm font-black bg-zinc-900 dark:bg-white dark:text-black transition hover:bg-brand-gold">
                <ShoppingBag size={16} />
                <span className="hidden md:inline">
                   {t.addToCart}
                </span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}