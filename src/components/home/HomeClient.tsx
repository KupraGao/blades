"use client";

import { useCallback, useState, type ReactNode } from "react";

import { Header } from "@/components/layout/Header";

import { HomepageHeroSliders } from "@/components/home/HomepageHeroSliders";
import { LatestProductsSlider } from "@/components/product/LatestProductsSlider";
import { CatalogLoadError } from "@/components/product/CatalogLoadError";
import { FeatureStrip } from "@/components/home/FeatureStrip";

import { ProductSectionClient } from "@/components/product/ProductSectionClient";
import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";
import type {
  CatalogBrandOption,
  CatalogCategory,
} from "@/lib/catalog/catalog-search-params";
import type { StorefrontPromoBanner } from "@/lib/promo/types";

export function HomeClient({
  latestProducts,
  saleProducts,
  promoBanners,
  discovery,
  categories,
  brands,
  accountHref = "/account/login",
  children,
}: {
  latestProducts: any[] | null;
  saleProducts: SaleSliderProduct[];
  promoBanners: StorefrontPromoBanner[];
  discovery: { products: any[]; catalogSize: number } | null;
  categories: CatalogCategory[];
  brands: CatalogBrandOption[];
  accountHref?: string;
  children: ReactNode;
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

        {latestProducts ? (
          <LatestProductsSlider products={latestProducts} />
        ) : discovery ? (
          <div className="container-page py-12"><CatalogLoadError /></div>
        ) : null}

        <FeatureStrip />

        {discovery ? (
          <ProductSectionClient
            products={discovery.products}
            catalogSize={discovery.catalogSize}
            categories={categories}
            brands={brands}
            filtersCollapsed={filtersCollapsed}
            onFiltersCollapsedChange={handleFiltersCollapsedChange}
          />
        ) : (
          <section id="products" className="container-page py-12"><CatalogLoadError /></section>
        )}

        {children}
      </main>
    </>
  );
}
