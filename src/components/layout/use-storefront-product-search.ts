"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setValue(urlSearch);
  }, [urlSearch]);

  function submit() {
    const href = buildStorefrontProductSearchHref(value);
    if (!href) return false;
    router.push(href);
    return true;
  }

  return { value, setValue, submit };
}
