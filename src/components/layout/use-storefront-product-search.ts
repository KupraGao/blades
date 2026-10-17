"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  buildStorefrontProductSearchHref,
  parseCatalogSearchTerm,
} from "@/lib/catalog/catalog-search-params";

export function useStorefrontProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = parseCatalogSearchTerm(searchParams.get("search")) ?? "";
  const [value, setValue] = useState(urlSearch);
  const [trackedSearch, setTrackedSearch] = useState(urlSearch);

  if (trackedSearch !== urlSearch) {
    setTrackedSearch(urlSearch);
    setValue(urlSearch);
  }

  function submit() {
    const href = buildStorefrontProductSearchHref(value);
    if (!href) return false;
    router.push(href);
    return true;
  }

  return { value, setValue, submit };
}
