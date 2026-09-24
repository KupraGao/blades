"use client";

import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";
import { PromoSlider } from "@/components/home/PromoSlider";
import { SaleProductsSlider } from "@/components/product/SaleProductsSlider";
import type { StorefrontPromoBanner } from "@/lib/promo/types";

type HomepageHeroSlidersProps = {
  saleProducts: SaleSliderProduct[];
  promoBanners: StorefrontPromoBanner[];
};

export function HomepageHeroSliders({
  saleProducts,
  promoBanners,
}: HomepageHeroSlidersProps) {
  const hasSaleProducts = saleProducts.length > 0;
  const hasPromoBanners = promoBanners.length > 0;

  if (!hasSaleProducts && !hasPromoBanners) {
    return null;
  }

  const both = hasSaleProducts && hasPromoBanners;

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
                both
                  ? "grid w-full min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6"
                  : "grid w-full min-w-0"
              }
            >
              {hasPromoBanners ? (
                <div className="min-h-0 min-w-0 lg:h-full">
                  <PromoSlider banners={promoBanners} fillHeight={both} />
                </div>
              ) : null}

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
