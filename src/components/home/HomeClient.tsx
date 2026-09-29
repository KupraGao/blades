"use client";

import { useCallback, useState } from "react";

import { Header } from "@/components/layout/Header";

import { HomepageHeroSliders } from "@/components/home/HomepageHeroSliders";
import { LatestProductsSlider } from "@/components/product/LatestProductsSlider";
import { LatestYoutubeVideos } from "@/components/home/LatestYoutubeVideos";
import { FeatureStrip } from "@/components/home/FeatureStrip";

import { ProductSectionClient } from "@/components/product/ProductSectionClient";
import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";
import type { CatalogCategory } from "@/lib/catalog/catalog-search-params";
import type { StorefrontPromoBanner } from "@/lib/promo/types";
import type { LatestYoutubeVideo } from "@/lib/youtube/fetch-latest-videos";

export function HomeClient({
  latestProducts,
  saleProducts,
  promoBanners,
  youtubeVideos,
  catalogProducts,
  catalogTotal,
  catalogTotalPages,
  currentPage,
  categories,
  accountHref = "/account/login",
}: {
  latestProducts: any[];
  saleProducts: SaleSliderProduct[];
  promoBanners: StorefrontPromoBanner[];
  youtubeVideos: LatestYoutubeVideo[];
  catalogProducts: any[];
  catalogTotal: number;
  catalogTotalPages: number;
  currentPage: number;
  categories: CatalogCategory[];
  accountHref?: string;
}) {
  // Existing Home Filters panel: collapsed=false means OPEN (matches CategoriesSidebar default).
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const handleFiltersCollapsedChange = useCallback((collapsed: boolean) => {
    setFiltersCollapsed(collapsed);
  }, []);

  const isFiltersOpen = !filtersCollapsed;

  return (
    <>
      <Header categories={categories} accountHref={accountHref} />

      {/* lg:pt-14 clears fixed ShopHeaderExtrasHost under the sticky Header */}
      <main className="lg:pt-14">
        <HomepageHeroSliders
          saleProducts={saleProducts}
          promoBanners={promoBanners}
        />

        <LatestProductsSlider
          products={latestProducts}
          isFiltersOpen={isFiltersOpen}
        />

        <FeatureStrip />

        <ProductSectionClient
          products={catalogProducts}
          categories={categories}
          currentPage={currentPage}
          totalPages={catalogTotalPages}
          total={catalogTotal}
          filtersCollapsed={filtersCollapsed}
          onFiltersCollapsedChange={handleFiltersCollapsedChange}
        />

        <LatestYoutubeVideos videos={youtubeVideos} />
      </main>
    </>
  );
}
