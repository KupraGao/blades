"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BrandLogo } from "@/components/brands/BrandLogo";
import { CategoriesSidebar } from "@/components/common/CategoriesSidebar";
import { CatalogPagination } from "@/components/product/CatalogPagination";
import { CatalogSortSelect } from "@/components/product/CatalogSortSelect";
import { ProductCard } from "@/components/product/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import type { BrandBySlugResult } from "@/actions/brands/get-brand-by-slug";
import { formatBrandProductCount } from "@/lib/catalog/brand-product-count";
import {
  catalogFiltersFromSearchParams,
  countActiveCatalogFilterGroups,
  type CatalogBrandOption,
  type CatalogCategory,
} from "@/lib/catalog/catalog-search-params";

type Props = {
  brand: BrandBySlugResult;
  products: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  categories: CatalogCategory[];
  brands: CatalogBrandOption[];
};

export function BrandProductsContent({
  brand,
  products,
  total,
  currentPage,
  totalPages,
  categories,
  brands,
}: Props) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const handleFiltersCollapsedChange = useCallback((collapsed: boolean) => {
    setFiltersCollapsed(collapsed);
  }, []);

  const isFiltersOpen = !filtersCollapsed;
  const countLabel = formatBrandProductCount(total, language, t);
  const isEmpty = total === 0 || products.length === 0;

  const catalogFilters = catalogFiltersFromSearchParams(searchParams);
  const activeFilterCount = countActiveCatalogFilterGroups({
    categoryId: catalogFilters.categoryId,
    minPrice: catalogFilters.minPrice,
    maxPrice: catalogFilters.maxPrice,
    sort: catalogFilters.sort,
  });
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="container-page">
      <CategoriesSidebar
        categories={categories}
        collapsed={filtersCollapsed}
        onCollapsedChange={handleFiltersCollapsedChange}
        brands={brands}
        showBrandFilter
        routeBrandSlug={brand.slug}
      />

      <div
        className={`mt-6 transition-[margin] duration-300 ease-out motion-reduce:transition-none ${
          isFiltersOpen ? "lg:ml-[272px]" : "lg:ml-0"
        }`}
      >
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <BrandLogo
              name={brand.name}
              logo={brand.logo}
              className="h-24 w-24 shrink-0 rounded-xl border border-zinc-200 dark:border-white/10 sm:h-28 sm:w-28"
              imgClassName="h-full w-full object-contain p-3"
              initialClassName="text-3xl font-bold text-zinc-400 dark:text-zinc-500"
            />

            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                {brand.name}
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
                {countLabel}
              </p>
            </div>
          </div>

          <CatalogSortSelect className="hidden w-full shrink-0 sm:max-w-xs lg:block" />
        </header>

        <section id="products" className="mt-10">
          {isEmpty ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.03]">
              {hasActiveFilters ? (
                <>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {t.catalogNoMatchingProducts}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {t.catalogNoMatchingProductsHint}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {t.brandNoProducts}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {t.brandNoProductsHint}
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 2xl:grid-cols-5">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
