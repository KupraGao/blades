"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ProductStockFilter() {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {

    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("stock", value);
    } else {
      params.delete("stock");
    }

    // ფილტრის შეცვლისას ყოველთვის პირველი გვერდიდან ვიწყებთ
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`);

  }

  return (

    <select
      value={searchParams.get("stock") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white lg:w-auto"
    >

      <option value="">
        All Stock
      </option>

      <option value="in-stock">
        In Stock
      </option>

      <option value="out-of-stock">
        Out of Stock
      </option>

    </select>

  );

}