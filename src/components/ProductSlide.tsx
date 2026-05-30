"use client";

import Link from "next/link";
import { useState } from "react";

type ProductSlideProps = {
  product: any;
};

export function ProductSlide({
  product,
}: ProductSlideProps) {

  const defaultImage =
    product.product_images?.find(
      (img: any) => img.is_main
    ) ||
    product.product_images?.[0];

  const [activeImage, setActiveImage] =
    useState(
      defaultImage?.image_url ||
      "/placeholder.png"
    );

  return (

    <div
      className="
        relative
        h-[480px]
        md:h-[680px]
      "
    >

      {/* MAIN IMAGE */}

      <img
        src={activeImage}
        alt={product.title}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          transition-all
          duration-500
        "
      />

      {/* OVERLAY */}

      <div
        className="
          absolute inset-0
          bg-gradient-to-r
          from-black/90
          via-black/50
          to-transparent
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          items-center
          p-8
          md:p-12
        "
      >

<div
  className="
    absolute
    top-10
    left-10
    max-w-xl
    rounded-xl
    border border-white/10
    bg-black/30
    p-6
    backdrop-blur-md
  "
>

          <p
            className="
              mb-4
              text-xs
              uppercase
              tracking-[0.3em]
              text-brand-gold
            "
          >
            ახალი დმატებული
          </p>

          <h2
            className="
              text-3xl
              font-black
              text-white
              md:text-5xl
            "
          >
            {product.title}
          </h2>

          <p
            className="
              mt-4
              text-2xl
              font-black
              text-brand-gold
            "
          >
            ₾{product.price}
          </p>

          <Link
            href={`/products/${product.id}`}
            className="
              mt-8
              inline-flex
              rounded-xl
              bg-brand-gold
              px-6
              py-3
              font-bold
              text-black
              transition
              hover:scale-105
            "
          >
            პროდუქტის ნახვა
          </Link>

        </div>

      </div>

      {/* THUMBNAILS */}

      <div
        className="
          absolute
          bottom-6
          right-6
          z-20
          flex
          gap-3
          rounded-xl
          border
          border-white/10
          bg-black/40
          p-3
          backdrop-blur-md
        "
      >

        {product.product_images
          ?.slice(0, 4)
          .map((img: any) => (

            <button
              key={img.id}
              type="button"
              title="პროდუქტის ფოტო"
              aria-label="პროდუქტის ფოტო"
              onMouseEnter={() =>
                setActiveImage(
                  img.image_url
                )
              }
              onClick={() =>
                setActiveImage(
                  img.image_url
                )
              }
              className={`
                overflow-hidden
                rounded-md
                border-2
                transition-all
                duration-300
                hover:scale-105
                ${
                  activeImage ===
                  img.image_url
                    ? "border-brand-gold"
                    : "border-white/20"
                }
              `}
            >

              <img
                src={img.image_url}
                alt={`${product.title} ფოტო`}
                className="
                  h-14
                  w-14
                  object-cover
                "
              />

            </button>

          ))}

      </div>

    </div>

  );

}