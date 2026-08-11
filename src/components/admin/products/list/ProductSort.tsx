"use client";

import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

export default function ProductSort() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    router.push(`/admin/products?${params.toString()}`);
  }

  return (
    <div className="relative w-full lg:w-auto">
      <ArrowUpDown
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
      />

      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => handleSort(e.target.value)}
        className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-10 text-white outline-none transition focus:border-zinc-600"
      >
        <option value="newest">{t.sortNewest}</option>

        <option value="oldest">{t.sortOldest}</option>

        <option value="price-asc">{t.sortPriceLowHigh}</option>

        <option value="price-desc">{t.sortPriceHighLow}</option>

        <option value="name-asc">{t.sortNameAZ}</option>

        <option value="name-desc">{t.sortNameZA}</option>
      </select>
    </div>
  );
}
