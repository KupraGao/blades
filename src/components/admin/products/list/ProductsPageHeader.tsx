"use client";

import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  search: React.ReactNode;
};

export default function ProductsPageHeader({ search }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 flex flex-wrap items-end gap-4">
      <div className="min-w-fit">
        <h1 className="text-4xl font-bold text-white">{t.products}</h1>

        <p className="mt-2 text-zinc-400">{t.manageProducts}</p>
      </div>

      <div className="hidden flex-1 md:block">{search}</div>

      <Link
        href="/admin/products/create"
        className="ml-auto rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
      >
        {t.addProduct}
      </Link>

      <div className="w-full md:hidden">{search}</div>
    </div>
  );
}
