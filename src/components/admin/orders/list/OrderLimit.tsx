"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

const LIMIT_OPTIONS = ["10", "25", "50", "100"] as const;

export default function OrderLimit() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleLimit(limit: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (limit === "10") {
      params.delete("limit");
    } else {
      params.set("limit", limit);
    }

    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <select
      value={searchParams.get("limit") ?? "10"}
      onChange={(e) => handleLimit(e.target.value)}
      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-zinc-600 lg:w-auto"
    >
      {LIMIT_OPTIONS.map((limit) => (
        <option key={limit} value={limit}>
          {t.showCount.replace("{count}", limit)}
        </option>
      ))}
    </select>
  );
}
