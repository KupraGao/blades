"use client";

import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";
import { PromoSlider } from "@/components/home/PromoSlider";
import { SaleProductsSlider } from "@/components/product/SaleProductsSlider";

type HomepageHeroSlidersProps = {
  saleProducts: SaleSliderProduct[];
};

export function HomepageHeroSliders({ saleProducts }: HomepageHeroSlidersProps) {
  const hasSaleProducts = saleProducts.length > 0;

  return (
    <section className="pt-12">
      <div className="container-page">
        {/*
          Match HeaderExtras Search/Filter geometry on lg:
          272px filter column + 24px gap = 296px, always reserved.
          Collapsed vs expanded Filters must not change this row's outer width.
        */}
        <div className="flex min-w-0">
          <div className="hidden w-[296px] shrink-0 lg:block" aria-hidden />

          <div className="min-w-0 flex-1">
            <div
              className={
                hasSaleProducts
                  ? "grid w-full min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6"
                  : "grid w-full min-w-0"
              }
            >
              <div className="min-h-0 min-w-0 lg:h-full">
                <PromoSlider fillHeight={hasSaleProducts} />
              </div>

              {hasSaleProducts ? (
                <div className="min-w-0 lg:h-full">
                  <SaleProductsSlider products={saleProducts} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
