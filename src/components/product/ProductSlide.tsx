"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type ProductSlideProps = {
  product: any;
};

export function ProductSlide({ product }: ProductSlideProps) {
  const { t } = useLanguage();

  const defaultImage =
    product.product_images?.find((img: any) => img.is_main) ||
    product.product_images?.[0];

  const [activeImage, setActiveImage] = useState(
    defaultImage?.image_url || "/placeholder.png"
  );

  return (
    <div className="relative h-[480px] md:h-[680px]">
      <img
        src={activeImage}
        alt={product.title}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      <div className="relative z-10 flex h-full items-center p-8 md:p-12">
        <div className="absolute left-4 top-4 max-w-[280px] rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-md md:left-10 md:top-10 md:max-w-xl md:p-6">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-gold md:mb-4 md:text-xs md:tracking-[0.3em]">
            {t.newArrival}
          </p>

          <h2 className="text-xl font-black leading-tight text-white md:text-5xl">
            {product.title}
          </h2>

          <p className="mt-2 text-lg font-black text-brand-gold md:mt-4 md:text-2xl">
            ₾{product.price}
          </p>

          <Link
            href={`/products/${product.id}`}
            className="mt-4 inline-flex rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-black transition hover:scale-105 md:mt-8 md:px-6 md:py-3 md:text-base"
          >
            {t.viewProduct}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex gap-3 rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
        {product.product_images?.slice(0, 4).map((img: any) => (
          <button
            key={img.id}
            type="button"
            title={t.productPhoto}
            aria-label={t.productPhoto}
            onMouseEnter={() => setActiveImage(img.image_url)}
            onClick={() => setActiveImage(img.image_url)}
            className={`overflow-hidden rounded-md border-2 transition-all duration-300 hover:scale-105 ${
              activeImage === img.image_url
                ? "border-brand-gold"
                : "border-white/20"
            }`}
          >
            <img
              src={img.image_url}
              alt={`${product.title} ფოტო`}
              className="h-14 w-14 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}