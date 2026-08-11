"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

export default function ProductLimit() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleLimit(limit: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("limit", limit);
    params.set("page", "1");

    router.push(`/admin/products?${params.toString()}`);
  }

  return (
    <select
      value={searchParams.get("limit") ?? "20"}
      onChange={(e) => handleLimit(e.target.value)}
      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-zinc-600 lg:w-auto"
    >
      <option value="5">{t.showCount.replace("{count}", "5")}</option>

      <option value="10">{t.showCount.replace("{count}", "10")}</option>

      <option value="25">{t.showCount.replace("{count}", "25")}</option>

      <option value="50">{t.showCount.replace("{count}", "50")}</option>

      <option value="100">{t.showCount.replace("{count}", "100")}</option>
    </select>
  );
}
