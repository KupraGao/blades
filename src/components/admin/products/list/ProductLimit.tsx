"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductLimit() {
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
      <option value="5">Show 5</option>

      <option value="10">Show 10</option>

      <option value="25">Show 25</option>

      <option value="50">Show 50</option>

      <option value="100">Show 100</option>
    </select>
  );
}
