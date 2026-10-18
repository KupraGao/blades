"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import {
  searchStorefrontProducts,
  type StorefrontProductSuggestion,
} from "@/actions/products/search-storefront-products";
import {
  buildStorefrontProductSearchHref,
  parseCatalogSearchTerm,
} from "@/lib/catalog/catalog-search-params";

const SEARCH_DEBOUNCE_MS = 300;

type SearchResult = {
  term: string;
  rows: StorefrontProductSuggestion[];
};

export function useProductSearchSuggestions(
  value: string,
  onNavigate?: () => void,
) {
  const router = useRouter();
  const listId = useId();
  const requestId = useRef(0);
  const term = parseCatalogSearchTerm(value);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [dismissedValue, setDismissedValue] = useState<string | null>(null);
  const [trackedValue, setTrackedValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);

  if (trackedValue !== value) {
    setTrackedValue(value);
    setActiveIndex(-1);
  }

  useEffect(() => {
    const id = ++requestId.current;
    if (!term) return;

    const timer = window.setTimeout(() => {
      void searchStorefrontProducts(term)
        .then((rows) => {
          if (requestId.current !== id) return;
          setResult({ term, rows });
        })
        .catch(() => {
          if (requestId.current !== id) return;
          setResult({ term, rows: [] });
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [term]);

  const settled = Boolean(term) && result?.term === term;
  const suggestions = settled && result ? result.rows : [];
  const loading = Boolean(term) && !settled;
  const empty = settled && suggestions.length === 0;
  const open = Boolean(term) && dismissedValue !== value;
  const seeAllHref = term ? buildStorefrontProductSearchHref(term) : null;

  const close = useCallback(() => {
    setDismissedValue(value);
  }, [value]);

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (loading) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
      return;
    }

    if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      activeIndex < suggestions.length
    ) {
      event.preventDefault();
      const product = suggestions[activeIndex];
      if (!product) return;
      close();
      onNavigate?.();
      router.push(`/products/${product.id}`);
    }
  }

  return {
    listId,
    open,
    loading,
    empty,
    suggestions,
    activeIndex,
    seeAllHref,
    close,
    onInputKeyDown,
  };
}
