"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCardAddToCartButton } from "@/components/product/ProductCardAddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getProductDiscountPercent, isProductOnSale } from "@/lib/products/pricing";

type ProductCardProps = {
  product: any;
};

export function ProductCard({ product }: ProductCardProps) {
  // =========================================
  // LANGUAGE + CART + WISHLIST
  // =========================================
  const { t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // =========================================
  // WISHLIST STATUS
  // =========================================
  const liked = isInWishlist(product.id);

  // =========================================
  // DEFAULT IMAGE
  // =========================================
  const defaultImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0];

  // =========================================
  // ACTIVE IMAGE
  // =========================================
  const [activeImage, setActiveImage] = useState(defaultImage?.image_url || "/placeholder.png");
  const onSale = isProductOnSale(product);
  const discountPercent = getProductDiscountPercent(product);

  // =========================================
  // PRODUCT CATEGORIES
  // =========================================
  const categories = product.product_categories?.map((pc: any) => pc.categories?.name) || [];

  return (
    <Link href={`/products/${product.id}`}>
      <article className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">

        {/* ========================================= */}
        {/* IMAGE */}
        {/* ========================================= */}
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <img src={activeImage} alt={product.title} className="absolute inset-0 h-full w-full object-cover object-center transition duration-1000 ease-out group-hover:scale-110" />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          {onSale && discountPercent !== null && discountPercent > 0 ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-orange px-2.5 py-1 text-xs font-bold text-white sm:left-3 sm:top-3 lg:left-4 lg:top-4">
              -{discountPercent}%
            </span>
          ) : null}

          {/* ========================================= */}
          {/* GALLERY PREVIEW */}
          {/* ========================================= */}
          <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 opacity-0 transition duration-300 group-hover:opacity-100 sm:bottom-3 sm:left-3 sm:gap-2 lg:bottom-4 lg:left-4">
            {product.product_images?.slice(0, 3).map((img: any) => (
              <img key={img.id} src={img.image_url} alt="" onMouseEnter={() => setActiveImage(img.image_url)} className="h-8 w-8 cursor-pointer rounded-md border border-zinc-200 bg-white object-cover shadow-md transition hover:scale-110 hover:border-brand-gold sm:h-10 sm:w-10 lg:h-12 lg:w-12 lg:rounded-lg" />
            ))}
          </div>

          {/* ========================================= */}
          {/* WISHLIST */}
          {/* ========================================= */}
          <button
            type="button"
            aria-label={liked ? t.removeFromWishlist : t.addToWishlist}
            title={liked ? t.removeFromWishlist : t.addToWishlist}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition sm:right-3 sm:top-3 sm:h-10 sm:w-10 lg:right-4 lg:top-4 ${
              liked
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-zinc-300 bg-white/90 text-zinc-900 hover:bg-brand-orange hover:text-white dark:border-white/10 dark:bg-black/40 dark:text-white"
            }`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}
        <div className="p-3 sm:p-3.5 lg:p-4">
          <h3 className="display-font line-clamp-1 text-sm font-bold leading-snug text-zinc-900 sm:text-base dark:text-white lg:text-lg">{product.title}</h3>

          {/* ========================================= */}
          {/* PRICE + ADD TO CART */}
          {/* ========================================= */}
          <div className="mt-2 flex items-end justify-between gap-2 sm:gap-3 lg:mt-2.5">
            <div className="min-w-0 flex-1">
              <ProductPrice product={product} size="card" showPercent={false} />
            </div>

            <ProductCardAddToCartButton product={product} />
          </div>
        </div>
      </article>
    </Link>
  );
}
