"use client";

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";

type ProductCardProps = {
  product: any;
};

export function ProductCard({
  product,
}: ProductCardProps) {

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
    <article
      className="
        group overflow-hidden rounded-3xl
        border border-white/10
        bg-white/[0.04]
        transition
        hover:-translate-y-1
        hover:border-brand-gold/50
        hover:bg-white/[0.06]
      "
    >

      {/* ========================================= */}
      {/* IMAGE */}
      {/* ========================================= */}

      <div
        className="
          relative aspect-square
          overflow-hidden bg-zinc-900
        "
      >

        <img
          src={activeImage}
          alt={product.title}
          className="
            absolute inset-0
            h-full w-full
            object-cover
            transition duration-500
            group-hover:scale-110
          "
        />

        {/* OVERLAY */}

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black
            via-black/20
            to-transparent
          "
        />

        {/* ========================================= */}
        {/* GALLERY PREVIEW */}
        {/* ========================================= */}

        <div
          className="
            absolute bottom-4 left-4
            flex gap-2
          "
        >

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
                className="
                  h-12 w-12
                  cursor-pointer
                  rounded-lg
                  border border-white/20
                  object-cover
                  backdrop-blur
                  transition
                  hover:scale-110
                  hover:border-brand-gold
                "
              />

            ))}

        </div>

        {/* WISHLIST */}

        <button
          type="button"
          aria-label="Add to wishlist"
          title="Add to wishlist"
          className="
            absolute right-4 top-4
            grid h-10 w-10
            place-items-center
            rounded-full
            border border-white/10
            bg-black/40
            text-white
            backdrop-blur
            transition
            hover:bg-brand-orange
          "
        >

          <Heart size={18} />

        </button>

      </div>

      {/* ========================================= */}
      {/* CONTENT */}
      {/* ========================================= */}

      <div className="p-5">

        <p
          className="
            text-xs font-bold uppercase
            tracking-[0.25em]
            text-zinc-500
          "
        >

          {categories.length
            ? categories.join(" • ")
            : "—"}

        </p>

        <h3
          className="
            mt-2 line-clamp-1
            font-serif text-xl
            font-bold text-white
          "
        >

          {product.title}

        </h3>

        {/* PRICE + ADD TO CART */}

        <div
          className="
            mt-4 flex
            items-center
            justify-between
            gap-3
          "
        >

          <span
            className="
              text-lg font-black
              text-brand-gold
            "
          >

            ₾{product.price}

          </span>

          <button
            type="button"
            aria-label="Add to cart"
            title="Add to cart"
            className="
              flex items-center
              gap-2 rounded-full
              bg-white px-4 py-2
              text-sm font-black
              text-black
              transition
              hover:bg-brand-gold
            "
          >

            <ShoppingBag size={16} />

            Add

          </button>

        </div>

      </div>

    </article>
  );
}