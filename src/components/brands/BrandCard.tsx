"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/brands/BrandLogo";
import { useLanguage } from "@/context/LanguageContext";
import type { StorefrontBrand } from "@/actions/brands/get-brands";
import { formatBrandProductCount } from "@/lib/catalog/brand-product-count";

type Props = {
  brand: StorefrontBrand;
};

export function BrandCard({ brand }: Props) {
  const { t, language } = useLanguage();
  const countLabel = formatBrandProductCount(brand.productCount, language, t);

  return (
    <Link
      href={`/brands/${encodeURIComponent(brand.slug)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-brand-gold/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-gold/40"
    >
      <BrandLogo
        name={brand.name}
        logo={brand.logo}
        className="aspect-[4/3] w-full border-b border-zinc-100 dark:border-white/10"
        imgClassName="h-full w-full object-contain p-6"
        initialClassName="text-4xl font-bold tracking-tight text-zinc-400 dark:text-zinc-500"
      />

      <div className="flex flex-1 flex-col gap-1 px-4 py-4">
        <h2 className="text-base font-semibold text-zinc-900 transition group-hover:text-brand-gold dark:text-white">
          {brand.name}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{countLabel}</p>
      </div>
    </Link>
  );
}
