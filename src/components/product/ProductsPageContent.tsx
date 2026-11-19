"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { getProducts } from "@/actions/products/get-products";
import { CategoriesSidebar } from "@/components/common/CategoriesSidebar";
import { CatalogLoadError } from "@/components/product/CatalogLoadError";
import { CatalogPagination } from "@/components/product/CatalogPagination";
import { CatalogSortSelect } from "@/components/product/CatalogSortSelect";
import { ProductCard } from "@/components/product/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { formatCatalogProductsFound } from "@/lib/catalog/brand-product-count";
import {
  catalogFiltersFromSearchParams,
  hasActiveCatalogUiFilters,
  type CatalogBrandOption,
  type CatalogCategory,
} from "@/lib/catalog/catalog-search-params";

type Props = {
  catalog: Awaited<ReturnType<typeof getProducts>>;
  currentPage: number;
  categories: CatalogCategory[];
  brands: CatalogBrandOption[];
};

export function ProductsPageContent({
  catalog,
  currentPage,
  categories,
  brands,
}: Props) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [filtersCollapsed, setFiltersCollapsed] = useState(() =>
    hasActiveCatalogUiFilters(catalogFiltersFromSearchParams(searchParams)),
  );
  const handleFiltersCollapsedChange = useCallback((collapsed: boolean) => {
    setFiltersCollapsed(collapsed);
  }, []);

  const isFiltersOpen = !filtersCollapsed;
  const products = catalog?.products ?? [];

  return (
    <div className="container-page">
      <CategoriesSidebar
        categories={categories}
        collapsed={filtersCollapsed}
        onCollapsedChange={handleFiltersCollapsedChange}
        brands={brands}
        showBrandFilter
      />

      <div
        className={`mt-6 transition-[margin] duration-300 ease-out motion-reduce:transition-none ${
          isFiltersOpen ? "lg:ml-[272px]" : "lg:ml-0"
        }`}
      >
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="storefront-section-heading">{t.products}</h1>
              {catalog && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatCatalogProductsFound(catalog.total, language, t)}
                </p>
              )}
            </div>

            <CatalogSortSelect className="hidden w-full shrink-0 sm:max-w-xs md:block" />
          </div>
        </header>

        <section id="products" className="mt-8">
          {!catalog ? <CatalogLoadError /> : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.03]">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t.catalogNoMatchingProducts}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t.catalogNoMatchingProductsHint}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 2xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <CatalogPagination
                currentPage={currentPage}
                totalPages={catalog.totalPages}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
