"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import type { StorefrontProductSuggestion } from "@/actions/products/search-storefront-products";
import { ProductPrice } from "@/components/product/ProductPrice";
import { useLanguage } from "@/context/LanguageContext";

type ProductSearchSuggestionsProps = {
  listId: string;
  open: boolean;
  loading: boolean;
  empty: boolean;
  suggestions: StorefrontProductSuggestion[];
  activeIndex: number;
  seeAllHref: string | null;
  onClose: () => void;
  onNavigate?: () => void;
};

function optionClassName(active: boolean) {
  return `flex w-full items-center gap-3 px-3 py-2 text-left text-black transition hover:bg-zinc-100 ${
    active ? "bg-zinc-100" : ""
  }`;
}

type ProductSearchFrameProps = ProductSearchSuggestionsProps & {
  className: string;
  children: ReactNode;
};

export function ProductSearchFrame({
  className,
  children,
  open,
  onClose,
  ...suggestions
}: ProductSearchFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  return (
    <div ref={rootRef} className={className}>
      {children}
      <ProductSearchSuggestions open={open} onClose={onClose} {...suggestions} />
    </div>
  );
}

function ProductSearchSuggestions({
  listId,
  open,
  loading,
  empty,
  suggestions,
  activeIndex,
  seeAllHref,
  onClose,
  onNavigate,
}: ProductSearchSuggestionsProps) {
  const { t } = useLanguage();

  if (!open) return null;

  const seeAllIndex = suggestions.length;

  return (
    <div
      id={listId}
      role="listbox"
      className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm text-black shadow-lg"
    >
      {loading ? (
        <p className="px-3 py-3 text-zinc-500">{t.searchSuggestionsLoading}</p>
      ) : null}

      {empty ? (
        <p className="px-3 py-3 text-zinc-500">{t.searchSuggestionsEmpty}</p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="lg:grid lg:grid-cols-2">
          {suggestions.map((product, index) => {
            const optionId = `${listId}-option-${index}`;
            const active = activeIndex === index;

            return (
              <Link
                key={product.id}
                id={optionId}
                role="option"
                aria-selected={active}
                href={`/products/${product.id}`}
                className={`${optionClassName(active)} ${
                  index % 2 === 0 ? "lg:border-r lg:border-zinc-100" : ""
                }`}
                onClick={() => {
                  onClose();
                  onNavigate?.();
                }}
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="h-12 w-12 shrink-0 rounded-lg bg-zinc-100" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{product.title}</span>
                  <ProductPrice
                    product={{
                      price: product.price,
                      sale_price: product.sale_price,
                    }}
                    size="compact"
                    showPercent={false}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {!loading && seeAllHref ? (
        <Link
          id={`${listId}-option-${seeAllIndex}`}
          role="option"
          aria-selected={activeIndex === seeAllIndex}
          href={seeAllHref}
          className={`${optionClassName(activeIndex === seeAllIndex)} border-t border-zinc-200 font-semibold`}
          onClick={() => {
            onClose();
            onNavigate?.();
          }}
        >
          {t.searchViewAllResults}
        </Link>
      ) : null}
    </div>
  );
}
