"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  buildCatalogQueryString,
  countActiveCatalogFilterGroups,
  type CatalogCategory,
} from "@/lib/catalog/catalog-search-params";
import { useLanguage } from "@/context/LanguageContext";

type MobileMenuDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  tab: string;
  setTab: (tab: string) => void;
  categories: CatalogCategory[];
};

const PRICE_DEBOUNCE_MS = 400;

export function MobileMenuDrawer({
  open,
  setOpen,
  tab,
  setTab,
  categories,
}: MobileMenuDrawerProps) {
  const { t, language } = useLanguage();
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

  const navItems = [
    { label: t.home, href: "/" },
    { label: t.products, href: "/#products" },
    { label: t.brands, href: "/brands" },
    { label: t.contact, href: "/contact" },
  ];

  // Home + Brand PLP: catalog Filters. Brands directory: menu only.
  const showCatalogFilters =
    pathname === "/" || Boolean(pathname?.startsWith("/brands/"));
  const filtersTabActive = tab === "filters" || tab === "categories";
  const activeTab = showCatalogFilters
    ? filtersTabActive
      ? "filters"
      : tab === "menu"
        ? "menu"
        : "filters"
    : "menu";

  const replaceCatalogParams = useCallback(
    (next: {
      categoryId?: string | null;
      minPrice?: number | null;
      maxPrice?: number | null;
      page?: number;
    }) => {
      const currentCategory = searchParams.get("category");
      const currentMin = searchParams.get("minPrice");
      const currentMax = searchParams.get("maxPrice");

      const categoryId =
        next.categoryId !== undefined ? next.categoryId : currentCategory;

      const minPrice =
        next.minPrice !== undefined
          ? next.minPrice
          : currentMin !== null && currentMin !== ""
            ? Number(currentMin)
            : null;

      const maxPrice =
        next.maxPrice !== undefined
          ? next.maxPrice
          : currentMax !== null && currentMax !== ""
            ? Number(currentMax)
            : null;

      const query = buildCatalogQueryString({
        categoryId: categoryId || null,
        minPrice:
          minPrice !== null && Number.isFinite(minPrice) ? minPrice : null,
        maxPrice:
          maxPrice !== null && Number.isFinite(maxPrice) ? maxPrice : null,
        page: next.page ?? 1,
      });

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  function scrollToProducts() {
    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 150);
  }

  function handleCategoryClick(categoryId: string | null) {
    replaceCatalogParams({ categoryId, page: 1 });
    setOpen(false);
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
    replaceCatalogParams({ minPrice, maxPrice, page: 1 });
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
    setOpen(false);
    scrollToProducts();
  }

  const parsedUrlMin =
    urlMin !== "" && Number.isFinite(Number(urlMin)) ? Number(urlMin) : null;
  const parsedUrlMax =
    urlMax !== "" && Number.isFinite(Number(urlMax)) ? Number(urlMax) : null;

  const activeCount = countActiveCatalogFilterGroups({
    categoryId: selectedCategoryId,
    minPrice: parsedUrlMin,
    maxPrice: parsedUrlMax,
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-20 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        id="mobile-menu-drawer"
        className={`fixed left-0 top-20 z-40 flex h-[calc(100dvh-5rem)] w-[min(20rem,100%)] max-w-full flex-col bg-white text-black transform transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t.search}
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none"
            />
            <button
              type="button"
              aria-label={t.search}
              className="shrink-0 rounded-lg bg-black px-3 text-white"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex border-b">
          {showCatalogFilters ? (
            <button
              type="button"
              onClick={() => setTab("filters")}
              className={`flex flex-1 items-center justify-center gap-2 py-3 font-bold ${
                activeTab === "filters"
                  ? "border-b-2 border-black"
                  : "text-gray-400"
              }`}
            >
              {t.filters}
              {activeCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-orange px-1.5 text-[11px] font-bold text-white">
                  {activeCount}
                </span>
              ) : null}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setTab("menu")}
            className={`flex-1 py-3 font-bold ${
              activeTab === "menu" ? "border-b-2 border-black" : "text-gray-400"
            }`}
          >
            {t.menu}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "menu" && (
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href + item.label}
                    href={item.href}
                    className="rounded-lg bg-gray-100 px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}

            {showCatalogFilters && activeTab === "filters" && (
              <div
                className={`flex flex-col gap-5 ${isPending ? "opacity-70" : ""}`}
              >
                <div>
                  <p className="mb-2 text-sm font-semibold text-zinc-900">
                    {t.catalogFilterCategory}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(null)}
                      aria-current={!selectedCategoryId ? "true" : undefined}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        !selectedCategoryId
                          ? "bg-orange-50 font-semibold text-orange-600"
                          : "font-medium text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="min-w-0 truncate">{t.allProducts}</span>
                      {!selectedCategoryId ? (
                        <Check
                          size={14}
                          className="shrink-0 text-orange-600"
                          aria-hidden
                        />
                      ) : null}
                    </button>

                    {categories.map((category) => {
                      const id = String(category.id);
                      const label =
                        language === "ka"
                          ? category.name_ka
                          : category.name_en;
                      const isActive = selectedCategoryId === id;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleCategoryClick(id)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            isActive
                              ? "bg-orange-50 font-semibold text-orange-600"
                              : "font-medium text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <span className="min-w-0 truncate">{label}</span>
                          {isActive ? (
                            <Check
                              size={14}
                              className="shrink-0 text-orange-600"
                              aria-hidden
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4">
                  <p className="mb-2 text-sm font-semibold text-zinc-900">
                    {t.catalogFilterPrice}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <label
                        htmlFor="mobile-catalog-min-price"
                        className="mb-1 block text-[11px] font-medium text-zinc-500"
                      >
                        {t.catalogPriceMinShort}
                      </label>
                      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 transition focus-within:border-brand-gold focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-gold/30">
                        <span
                          className="shrink-0 text-xs font-semibold text-zinc-400"
                          aria-hidden
                        >
                          ₾
                        </span>
                        <input
                          id="mobile-catalog-min-price"
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
                          className="min-w-0 flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-zinc-400"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label
                        htmlFor="mobile-catalog-max-price"
                        className="mb-1 block text-[11px] font-medium text-zinc-500"
                      >
                        {t.catalogPriceMaxShort}
                      </label>
                      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 transition focus-within:border-brand-gold focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-gold/30">
                        <span
                          className="shrink-0 text-xs font-semibold text-zinc-400"
                          aria-hidden
                        >
                          ₾
                        </span>
                        <input
                          id="mobile-catalog-max-price"
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
                          className="min-w-0 flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>

                  {priceError ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {priceError}
                    </p>
                  ) : null}

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      disabled={activeCount === 0}
                      className="rounded-lg border border-brand-orange/45 bg-brand-orange/10 px-3 py-1.5 text-sm font-semibold text-brand-orange transition hover:border-brand-orange hover:bg-brand-orange/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.clearFilters}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
