"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";

import { CatalogBrandFilter } from "@/components/product/CatalogBrandFilter";
import { CatalogCategoryFilter } from "@/components/product/CatalogCategoryFilter";
import { CatalogFiltersScrollArea } from "@/components/product/CatalogFiltersScrollArea";
import {
  buildCatalogBrandLocation,
  buildCatalogFilterHref,
  catalogFiltersFromSearchParams,
  countActiveCatalogFilterGroups,
  type CatalogBrandOption,
  type CatalogCategory,
  type CatalogQueryFields,
} from "@/lib/catalog/catalog-search-params";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  categories: CatalogCategory[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  brands?: CatalogBrandOption[];
  showBrandFilter?: boolean;
  /** Brand PLP path slug — selected brand when `brand` is not a query param. */
  routeBrandSlug?: string | null;
  /** Home: sync open/closed with scroll. Products / Brand PLP: false (user-controlled). */
  syncCollapsedOnScroll?: boolean;
};

const PRICE_DEBOUNCE_MS = 400;

export function CategoriesSidebar({
  categories,
  collapsed,
  onCollapsedChange,
  brands = [],
  showBrandFilter = false,
  routeBrandSlug = null,
  syncCollapsedOnScroll = false,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategoryId = searchParams.get("category");
  const urlMin = searchParams.get("minPrice") ?? "";
  const urlMax = searchParams.get("maxPrice") ?? "";

  const [minDraft, setMinDraft] = useState(urlMin);
  const [maxDraft, setMaxDraft] = useState(urlMax);
  const [priceError, setPriceError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMinDraft(urlMin);
    setMaxDraft(urlMax);
    setPriceError(null);
  }, [urlMin, urlMax]);

  useEffect(() => {
    if (!syncCollapsedOnScroll) return;

    const handleScroll = () => {
      onCollapsedChange(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onCollapsedChange, syncCollapsedOnScroll]);

  const navigateCatalogHref = useCallback(
    (href: string) => {
      startTransition(() => {
        if (pathname === "/") {
          router.push(href);
        } else {
          router.replace(href, { scroll: false });
        }
      });
    },
    [pathname, router],
  );

  const replaceCatalogParams = useCallback(
    (next: CatalogQueryFields) => {
      navigateCatalogHref(buildCatalogFilterHref(pathname, searchParams, next));
    },
    [navigateCatalogHref, pathname, searchParams],
  );

  function scrollToProducts() {
    if (pathname === "/") return;

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  function handleCategoryClick(categoryId: string | null) {
    replaceCatalogParams({
      categoryId,
      page: 1,
    });
    scrollToProducts();
  }

  function handleBrandChange(brandSlug: string | null) {
    const href = buildCatalogBrandLocation(pathname, searchParams, brandSlug);
    navigateCatalogHref(href);
    scrollToProducts();
  }

  function parseDraftPrice(raw: string): number | null {
    if (raw.trim() === "") return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return null;
    return value;
  }

  function commitPriceDrafts(nextMin: string, nextMax: string) {
    const minPrice = parseDraftPrice(nextMin);
    const maxPrice = parseDraftPrice(nextMax);

    if (nextMin.trim() !== "" && minPrice === null) {
      setPriceError(t.catalogPriceInvalid);
      return;
    }

    if (nextMax.trim() !== "" && maxPrice === null) {
      setPriceError(t.catalogPriceInvalid);
      return;
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      setPriceError(t.catalogPriceMinMaxInvalid);
      return;
    }

    setPriceError(null);
    replaceCatalogParams({
      minPrice,
      maxPrice,
      page: 1,
    });
  }

  function schedulePriceCommit(nextMin: string, nextMax: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      commitPriceDrafts(nextMin, nextMax);
    }, PRICE_DEBOUNCE_MS);
  }

  function handleClearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setMinDraft("");
    setMaxDraft("");
    setPriceError(null);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    scrollToProducts();
  }

  const catalogFilters = catalogFiltersFromSearchParams(searchParams);

  const selectedBrandSlug = catalogFilters.brandSlug ?? routeBrandSlug;

  const parsedUrlMin =
    urlMin !== "" && Number.isFinite(Number(urlMin)) ? Number(urlMin) : null;
  const parsedUrlMax =
    urlMax !== "" && Number.isFinite(Number(urlMax)) ? Number(urlMax) : null;

  const activeCount = countActiveCatalogFilterGroups({
    categoryId: selectedCategoryId,
    minPrice: parsedUrlMin,
    maxPrice: parsedUrlMax,
    brandSlug: catalogFilters.brandSlug,
    sort: catalogFilters.sort,
  });

  const panelId = "home-catalog-filters-panel";

  const categoryRowClass = (isActive: boolean) =>
    `flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
      isActive
        ? "bg-orange-50 font-semibold text-orange-600"
        : "font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
    }`;

  const priceFieldClass =
    "flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 px-2 py-1.5 transition focus-within:border-brand-gold focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-gold/30";

  return (
    <aside className="pointer-events-none fixed left-0 top-[80px] z-[41] hidden w-full lg:block">
      <div className="container-page pointer-events-auto relative">
        <div className="absolute left-7 w-64">
          <div
            className={`overflow-hidden rounded-xl border border-zinc-800/80 bg-white shadow-xl shadow-black/20 ${
              collapsed
                ? ""
                : "flex max-h-[calc(100dvh-5rem-0.5rem)] flex-col"
            }`}
          >
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-controls={panelId}
              onClick={() => onCollapsedChange(!collapsed)}
              className="flex w-full shrink-0 items-center justify-between bg-black px-4 py-4 text-white"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Menu size={18} />
                {t.filters}
                {activeCount > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-orange px-1.5 text-[11px] font-bold text-white">
                    {activeCount}
                  </span>
                ) : null}
              </span>

              {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            <div
              id={panelId}
              className={`grid min-h-0 bg-white transition-all duration-300 ease-in-out ${
                collapsed
                  ? "grid-rows-[0fr]"
                  : "min-h-0 flex-1 grid-rows-[1fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <CatalogFiltersScrollArea
                  className={`h-full ${isPending ? "opacity-70" : ""}`}
                  contentClassName="px-3 py-3"
                >
                  <CatalogCategoryFilter
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryChange={handleCategoryClick}
                    rowClassName={categoryRowClass}
                  />

                  {showBrandFilter ? (
                    <CatalogBrandFilter
                      brands={brands}
                      selectedBrandSlug={selectedBrandSlug}
                      onBrandChange={handleBrandChange}
                      rowClassName={categoryRowClass}
                    />
                  ) : null}

                  <div className="mt-3 border-t border-zinc-200 pt-3">
                    <p className="mb-2 text-sm font-semibold text-zinc-900">
                      {t.catalogFilterPrice}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="min-w-0">
                        <label
                          htmlFor="catalog-min-price"
                          className="mb-1 block text-[11px] font-medium text-zinc-500"
                        >
                          {t.catalogPriceMinShort}
                        </label>
                        <div className={priceFieldClass}>
                          <span
                            className="shrink-0 text-xs font-semibold text-zinc-400"
                            aria-hidden
                          >
                            ₾
                          </span>
                          <input
                            id="catalog-min-price"
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={1}
                            value={minDraft}
                            placeholder="0"
                            aria-label={t.catalogMinPrice}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMinDraft(value);
                              schedulePriceCommit(value, maxDraft);
                            }}
                            onBlur={() => commitPriceDrafts(minDraft, maxDraft)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitPriceDrafts(minDraft, maxDraft);
                              }
                            }}
                            className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-zinc-900 outline-none placeholder:text-zinc-400"
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="catalog-max-price"
                          className="mb-1 block text-[11px] font-medium text-zinc-500"
                        >
                          {t.catalogPriceMaxShort}
                        </label>
                        <div className={priceFieldClass}>
                          <span
                            className="shrink-0 text-xs font-semibold text-zinc-400"
                            aria-hidden
                          >
                            ₾
                          </span>
                          <input
                            id="catalog-max-price"
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={1}
                            value={maxDraft}
                            placeholder="—"
                            aria-label={t.catalogMaxPrice}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMaxDraft(value);
                              schedulePriceCommit(minDraft, value);
                            }}
                            onBlur={() => commitPriceDrafts(minDraft, maxDraft)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitPriceDrafts(minDraft, maxDraft);
                              }
                            }}
                            className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-zinc-900 outline-none placeholder:text-zinc-400"
                          />
                        </div>
                      </div>
                    </div>

                    {priceError ? (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {priceError}
                      </p>
                    ) : null}
                  </div>

                  {activeCount > 0 ? (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="rounded-lg border border-brand-orange/45 bg-brand-orange/10 px-3 py-1.5 text-xs font-semibold text-brand-orange transition hover:border-brand-orange hover:bg-brand-orange/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  ) : null}
                </CatalogFiltersScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
