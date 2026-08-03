"use client";

import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSort() {

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

        <option value="newest">
          Newest
        </option>

        <option value="oldest">
          Oldest
        </option>

        <option value="price-asc">
          Price: Low to High
        </option>

        <option value="price-desc">
          Price: High to Low
        </option>

        <option value="name-asc">
          Name: A-Z
        </option>

        <option value="name-desc">
          Name: Z-A
        </option>

      </select>

    </div>

  );

}