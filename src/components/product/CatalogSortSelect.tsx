"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import {
  CATALOG_SORT_OPTIONS,
  catalogFiltersFromSearchParams,
  mergeCatalogQueryString,
  type CatalogSortValue,
} from "@/lib/catalog/catalog-search-params";

const SELECT_VALUE_NEWEST = "newest";

type SortOptionValue = typeof SELECT_VALUE_NEWEST | CatalogSortValue;

export function CatalogSortSelect({ className }: { className?: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const current = catalogFiltersFromSearchParams(searchParams);
  const selectedValue: SortOptionValue = current.sort ?? SELECT_VALUE_NEWEST;

  const options: Array<{ value: SortOptionValue; label: string }> = [
    { value: SELECT_VALUE_NEWEST, label: t.sortNewest },
    { value: "oldest", label: t.sortOldest },
    { value: "price-asc", label: t.sortPriceLowHigh },
    { value: "price-desc", label: t.sortPriceHighLow },
    { value: "name-asc", label: t.sortNameAZ },
    { value: "name-desc", label: t.sortNameZA },
  ];

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ??
    t.sortNewest;

  const close = useCallback(() => setOpen(false), []);

  const handleChange = useCallback(
    (value: SortOptionValue) => {
      const currentFilters = catalogFiltersFromSearchParams(searchParams);
      const sort: CatalogSortValue | null = CATALOG_SORT_OPTIONS.includes(
        value as CatalogSortValue,
      )
        ? (value as CatalogSortValue)
        : null;

      const query = mergeCatalogQueryString(currentFilters, { sort, page: 1 });

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
      close();
    },
    [close, pathname, router, searchParams],
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <span className="sr-only">{t.catalogFilterSort}</span>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        disabled={isPending}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-800 outline-none transition hover:border-brand-gold/70 focus-visible:border-brand-gold focus-visible:ring-1 focus-visible:ring-brand-gold/30 disabled:opacity-70 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 text-zinc-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="menu"
          className="absolute right-0 z-50 mt-1 w-full min-w-[16rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg shadow-black/15 dark:border-white/15 dark:bg-zinc-900 dark:shadow-black/50"
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => handleChange(option.value)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-orange-50 font-semibold text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
                      : "font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {isSelected ? (
                    <Check size={14} className="shrink-0" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
