"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductPrice } from "@/components/product/ProductPrice";
import { useLanguage } from "@/context/LanguageContext";
import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";

type SaleProductsSliderProps = {
  products: SaleSliderProduct[];
};

function mainImageUrl(product: SaleSliderProduct): string {
  const main =
    product.product_images?.find((image) => image.is_main) ||
    product.product_images?.[0];

  return main?.image_url || "/placeholder.png";
}

export function SaleProductsSlider({ products }: SaleProductsSliderProps) {
  const { t } = useLanguage();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });

  const syncState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    syncState();
    emblaApi.on("select", syncState);
    emblaApi.on("reInit", syncState);

    return () => {
      emblaApi.off("select", syncState);
      emblaApi.off("reInit", syncState);
    };
  }, [emblaApi, syncState]);

  const showNav = canScrollPrev || canScrollNext;

  return (
    <div
      className="flex w-full min-w-0 flex-col lg:h-full"
      aria-roledescription="carousel"
      aria-label={t.sale}
    >
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3 lg:mb-4">
        <h2 className="section-title min-w-0 truncate">{t.sale}</h2>

        {showNav ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={t.previous}
              title={t.previous}
              disabled={!canScrollPrev}
              onClick={() => emblaApi?.scrollPrev()}
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition enabled:hover:border-brand-gold enabled:hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label={t.next}
              title={t.next}
              disabled={!canScrollNext}
              onClick={() => emblaApi?.scrollNext()}
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition enabled:hover:border-brand-gold enabled:hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div ref={emblaRef} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {/*
          Visible cards: 1 (<360px) → 2 (phone) → 3 (md–lg) → 1 (lg+ column).
          Inverse of a typical 1→2→3 desktop sequence because Sale is a
          narrow side column at lg and a full-width stacked row below lg.
        */}
        <div className="flex h-full min-w-0 gap-0 min-[360px]:gap-3 lg:gap-0">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-h-0 min-w-0 flex-[0_0_100%] self-stretch min-[360px]:flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_100%]"
            >
              <Link
                href={`/products/${product.id}`}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white outline-none transition hover:border-brand-gold/50 focus-visible:ring-2 focus-visible:ring-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={mainImageUrl(product)}
                    alt={product.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-w-0 flex-col p-3 lg:p-4">
                  <h3 className="line-clamp-2 min-w-0 font-serif text-sm font-bold text-zinc-900 sm:text-base dark:text-white lg:text-lg">
                    {product.title}
                  </h3>

                  <div className="mt-2 min-w-0">
                    <ProductPrice product={product} size="compact" />
                  </div>

                  <span className="mt-3 inline-flex min-h-10 w-fit max-w-full items-center rounded-xl bg-brand-gold px-3 py-2 text-xs font-bold text-black sm:text-sm lg:mt-4 lg:min-h-11 lg:px-4">
                    {t.viewProduct}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
