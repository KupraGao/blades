"use client";

import { Header } from "@/components/layout/Header";
import { HeaderExtras } from "@/components/layout/HeaderExtras";

import { LatestProductsSlider } from "@/components/product/LatestProductsSlider";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureStrip } from "@/components/home/FeatureStrip";

import { ProductSectionClient } from "@/components/product/ProductSectionClient";
import type { CatalogCategory } from "@/lib/catalog/catalog-search-params";

export function HomeClient({
  latestProducts,
  catalogProducts,
  catalogTotal,
  catalogTotalPages,
  currentPage,
  categories,
  accountHref = "/account/login",
}: {
  latestProducts: any[];
  catalogProducts: any[];
  catalogTotal: number;
  catalogTotalPages: number;
  currentPage: number;
  categories: CatalogCategory[];
  accountHref?: string;
}) {
  return (
    <>
      <Header categories={categories} accountHref={accountHref} />

      <HeaderExtras />

      <main>
        <LatestProductsSlider products={latestProducts} />

        <FeatureStrip />

        <ProductSectionClient
          products={catalogProducts}
          categories={categories}
          currentPage={currentPage}
          totalPages={catalogTotalPages}
          total={catalogTotal}
        />

        <PromoBanner />
      </main>
    </>
  );
}
