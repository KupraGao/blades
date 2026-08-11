"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";

export default function OrderSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const nextSearch = value.trim();
      const currentSearch = (params.get("search") ?? "").trim();

      if (nextSearch === currentSearch) {
        return;
      }

      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }

      params.delete("page");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, pathname, router]);

  return (
    <div className="relative w-full lg:w-80">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
      />

      <input
        type="text"
        placeholder={t.searchOrders}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-white outline-none transition focus:border-zinc-600"
      />
    </div>
  );
}
