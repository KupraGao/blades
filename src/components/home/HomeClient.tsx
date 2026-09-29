"use client";

import { useCallback, useState } from "react";

import { Header } from "@/components/layout/Header";

import { HomepageHeroSliders } from "@/components/home/HomepageHeroSliders";
import { LatestProductsSlider } from "@/components/product/LatestProductsSlider";
import { LatestYoutubeVideos } from "@/components/home/LatestYoutubeVideos";
import { FeatureStrip } from "@/components/home/FeatureStrip";

import { ProductSectionClient } from "@/components/product/ProductSectionClient";
import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";
import type {
  CatalogBrandOption,
  CatalogCategory,
} from "@/lib/catalog/catalog-search-params";
import type { StorefrontPromoBanner } from "@/lib/promo/types";
import type { LatestYoutubeVideo } from "@/lib/youtube/fetch-latest-videos";

export function HomeClient({
  latestProducts,
  saleProducts,
  promoBanners,
  youtubeVideos,
  discoveryProducts,
  discoveryCatalogSize,
  categories,
  brands,
  accountHref = "/account/login",
}: {
  latestProducts: any[];
  saleProducts: SaleSliderProduct[];
  promoBanners: StorefrontPromoBanner[];
  youtubeVideos: LatestYoutubeVideo[];
  discoveryProducts: any[];
  discoveryCatalogSize: number;
  categories: CatalogCategory[];
  brands: CatalogBrandOption[];
  accountHref?: string;
}) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const handleFiltersCollapsedChange = useCallback((collapsed: boolean) => {
    setFiltersCollapsed(collapsed);
  }, []);

  return (
    <>
      <Header
        categories={categories}
        accountHref={accountHref}
        brands={brands}
      />

      {/* lg:pt-14 clears fixed ShopHeaderExtrasHost under the sticky Header */}
      <main className="lg:pt-14">
        <HomepageHeroSliders
          saleProducts={saleProducts}
          promoBanners={promoBanners}
        />

        <LatestProductsSlider products={latestProducts} />

        <FeatureStrip />

        <ProductSectionClient
          products={discoveryProducts}
          catalogSize={discoveryCatalogSize}
          categories={categories}
          brands={brands}
          filtersCollapsed={filtersCollapsed}
          onFiltersCollapsedChange={handleFiltersCollapsedChange}
        />

        <LatestYoutubeVideos videos={youtubeVideos} />
      </main>
    </>
  );
}
