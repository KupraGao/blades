"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BrandLogo } from "@/components/brands/BrandLogo";
import { CategoriesSidebar } from "@/components/common/CategoriesSidebar";
import { CatalogPagination } from "@/components/product/CatalogPagination";
import { ProductCard } from "@/components/product/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import type { BrandBySlugResult } from "@/actions/brands/get-brand-by-slug";
import { formatBrandProductCount } from "@/lib/catalog/brand-product-count";
import {
  countActiveCatalogFilterGroups,
  type CatalogCategory,
} from "@/lib/catalog/catalog-search-params";

type Props = {
  brand: BrandBySlugResult;
  products: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  categories: CatalogCategory[];
};

export function BrandProductsContent({
  brand,
  products,
  total,
  currentPage,
  totalPages,
  categories,
}: Props) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  // Brand PLP: sidebar CLOSED by default (Home remains OPEN via its own state).
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const handleFiltersCollapsedChange = useCallback((collapsed: boolean) => {
    setFiltersCollapsed(collapsed);
  }, []);

  const isFiltersOpen = !filtersCollapsed;
  const countLabel = formatBrandProductCount(total, language, t);
  const isEmpty = total === 0 || products.length === 0;

  const urlMin = searchParams.get("minPrice") ?? "";
  const urlMax = searchParams.get("maxPrice") ?? "";
  const parsedUrlMin =
    urlMin !== "" && Number.isFinite(Number(urlMin)) ? Number(urlMin) : null;
  const parsedUrlMax =
    urlMax !== "" && Number.isFinite(Number(urlMax)) ? Number(urlMax) : null;

  const activeFilterCount = countActiveCatalogFilterGroups({
    categoryId: searchParams.get("category"),
    minPrice: parsedUrlMin,
    maxPrice: parsedUrlMax,
  });
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="container-page">
      <CategoriesSidebar
        categories={categories}
        collapsed={filtersCollapsed}
        onCollapsedChange={handleFiltersCollapsedChange}
        syncCollapsedOnScroll={false}
      />

      <div className="mt-6">
        <header
          className={`flex flex-col items-start gap-5 transition-[margin] duration-300 ease-out motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-6 ${
            isFiltersOpen ? "lg:ml-[272px]" : "lg:ml-0"
          }`}
        >
          <BrandLogo
            name={brand.name}
            logo={brand.logo}
            className="h-24 w-24 shrink-0 rounded-2xl border border-zinc-200 dark:border-white/10 sm:h-28 sm:w-28"
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
        </header>
      </div>

      <section id="products" className="mt-10">
        {isEmpty ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.03]">
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
  );
}
