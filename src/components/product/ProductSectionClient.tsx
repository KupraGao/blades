"use client";

import { ProductCard } from "./ProductCard";
import { CatalogPagination } from "./CatalogPagination";
import { CategoriesSidebar } from "@/components/common/CategoriesSidebar";
import { useLanguage } from "@/context/LanguageContext";
import type { CatalogCategory } from "@/lib/catalog/catalog-search-params";

type ProductSectionClientProps = {
  products: any[];
  categories: CatalogCategory[];
  currentPage: number;
  totalPages: number;
  total: number;
  filtersCollapsed: boolean;
  onFiltersCollapsedChange: (collapsed: boolean) => void;
};

export function ProductSectionClient({
  products,
  categories,
  currentPage,
  totalPages,
  total,
  filtersCollapsed,
  onFiltersCollapsedChange,
}: ProductSectionClientProps) {
  const { t } = useLanguage();
  const safeProducts = Array.isArray(products) ? products : [];
  const isEmpty = total === 0 || safeProducts.length === 0;

  return (
    <section id="products" className="section-pad bg-black/25">
      <div className="container-page">
        <CategoriesSidebar
          categories={categories}
          collapsed={filtersCollapsed}
          onCollapsedChange={onFiltersCollapsedChange}
        />

        <h2 className="storefront-section-heading mb-3 lg:mb-4">
          {t.featuredProducts}
        </h2>

        {isEmpty ? (
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
              {safeProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </section>
  );
}
