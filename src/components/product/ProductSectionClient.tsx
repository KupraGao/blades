"use client";

import { useRef, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

import { ProductCard } from "./ProductCard";
import { CategoriesSidebar } from "@/components/common/CategoriesSidebar";
import { getHomeDiscoveryProducts } from "@/actions/products/get-home-discovery-products";
import { useLanguage } from "@/context/LanguageContext";
import { HOME_DISCOVERY_LIMIT } from "@/lib/catalog/catalog-search-params";
import type {
  CatalogBrandOption,
  CatalogCategory,
} from "@/lib/catalog/catalog-search-params";

type ProductSectionClientProps = {
  products: any[];
  catalogSize: number;
  categories: CatalogCategory[];
  brands: CatalogBrandOption[];
  filtersCollapsed: boolean;
  onFiltersCollapsedChange: (collapsed: boolean) => void;
};

export function ProductSectionClient({
  products,
  catalogSize,
  categories,
  brands,
  filtersCollapsed,
  onFiltersCollapsedChange,
}: ProductSectionClientProps) {
  const { t } = useLanguage();
  const [recommended, setRecommended] = useState(() =>
    Array.isArray(products) ? products : [],
  );
  const [availableCount, setAvailableCount] = useState(catalogSize);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshLock = useRef(false);

  const isEmpty = recommended.length === 0;
  const showRefresh = availableCount > HOME_DISCOVERY_LIMIT;

  async function handleRefresh() {
    if (refreshLock.current || isRefreshing) return;

    refreshLock.current = true;
    setIsRefreshing(true);

    try {
      const previousIds = recommended
        .map((product) => product?.id)
        .filter(Boolean)
        .map((id) => String(id));

      const result = await getHomeDiscoveryProducts(previousIds);

      if (typeof result.catalogSize === "number") {
        setAvailableCount(result.catalogSize);
      }

      if (Array.isArray(result.products) && result.products.length > 0) {
        setRecommended(result.products);
      }
    } catch {
      // Keep the current grid; button becomes usable again in finally.
    } finally {
      refreshLock.current = false;
      setIsRefreshing(false);
    }
  }

  return (
    <section id="products" className="py-12 dark:bg-black/25">
      <div className="container-page">
        <CategoriesSidebar
          categories={categories}
          collapsed={filtersCollapsed}
          onCollapsedChange={onFiltersCollapsedChange}
          brands={brands}
          showBrandFilter
          syncCollapsedOnScroll
        />

        <div className="mb-3 flex items-center justify-between gap-3 lg:mb-4">
          <h2 className="storefront-section-heading min-w-0 truncate">
            {t.discoverProducts}
          </h2>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {showRefresh ? (
              <button
                type="button"
                disabled={isRefreshing}
                aria-label={t.refreshRecommended}
                onClick={handleRefresh}
                className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-brand-gold"
              >
                <RefreshCw
                  size={18}
                  aria-hidden
                  className={isRefreshing ? "animate-spin" : undefined}
                />
              </button>
            ) : null}

            <a
              href="/products"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-brand-gold transition hover:opacity-80"
            >
              {t.viewAllProducts}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

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
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 2xl:grid-cols-5">
            {recommended.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
