"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

type Props = {
  brands: Brand[];
};

export default function ProductBrandFilter({ brands }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("brand", value);
    } else {
      params.delete("brand");
    }

    // ფილტრის შეცვლისას ყოველთვის პირველი გვერდიდან ვიწყებთ
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={searchParams.get("brand") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white lg:w-auto"
    >
      <option value="">{t.allBrands}</option>

      {brands.map((brand) => (
        <option key={brand.id} value={brand.id}>
          {brand.name}
        </option>
      ))}
    </select>
  );
}
