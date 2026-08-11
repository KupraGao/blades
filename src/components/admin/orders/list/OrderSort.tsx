"use client";

import { ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

export default function OrderSort() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
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
      </select>
    </div>
  );
}
