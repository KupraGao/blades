"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: number;
  name_ka: string;
  name_en: string;
};

type Props = {
  categories: Category[];
};

export default function ProductCategoryFilter({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    // ფილტრის შეცვლისას ყოველთვის პირველი გვერდიდან ვიწყებთ
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={searchParams.get("category") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white lg:w-auto"
    >
      <option value="">კატეგორიები</option>

      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name_ka}
        </option>
      ))}
    </select>
  );
}
