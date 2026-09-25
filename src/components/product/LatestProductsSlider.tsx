"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "./ProductCard";

type LatestProductsSliderProps = {
  products: any[];
  isFiltersOpen?: boolean;
};

export function LatestProductsSlider({
  products,
  isFiltersOpen = true,
}: LatestProductsSliderProps) {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    loop: false,
  });

  const syncState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
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

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
      return;
    }
    if (emblaApi.canScrollPrev()) {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (!canScrollNext && !canScrollPrev) return;

    const interval = setInterval(autoplay, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, autoplay, canScrollNext, canScrollPrev]);

  const showNav = scrollSnaps.length > 1;

  return (
    <section className="py-12">
      <div className="container-page">
        <div className="mb-3 flex items-center justify-between gap-3 lg:mb-4">
          <div
            className={`min-w-0 transition-[margin] duration-300 ease-out motion-reduce:transition-none ${
              isFiltersOpen ? "lg:ml-[272px]" : "lg:ml-0"
            }`}
          >
            <h2 className="storefront-section-heading">{t.latestProducts}</h2>
          </div>

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

        <div ref={emblaRef} className="w-full overflow-hidden">
          <div className="flex gap-3 md:gap-4 lg:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-4.5rem)/4)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {showNav ? (
          <div className="mt-6 flex justify-center gap-3">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                title={t.slideLabel.replace("{count}", String(index + 1))}
                aria-label={t.slideLabel.replace("{count}", String(index + 1))}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1.5 w-10 rounded-full transition-all ${
                  selectedIndex === index ? "bg-brand-gold" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
