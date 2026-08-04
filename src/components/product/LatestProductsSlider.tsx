"use client";

import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductSlide } from "./ProductSlide";

type LatestProductsSliderProps = {
  products: any[];
};

export function LatestProductsSlider({ products }: LatestProductsSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
  });

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(autoplay, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, autoplay]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="py-12">
      <div className="container-page">
        <div
          ref={emblaRef}
          className="mx-auto w-full overflow-hidden rounded-lg border border-white/10 lg:w-[65%]"
        >
          <div className="flex">
            {products.map((product) => (
              <div key={product.id} className="min-w-0 flex-[0_0_100%]">
                <ProductSlide product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              title={`სლაიდი ${index + 1}`}
              aria-label={`სლაიდი ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 w-10 rounded-full transition-all ${
                selectedIndex === index ? "bg-brand-gold" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}