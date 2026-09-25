"use client";

import { BrandCard } from "@/components/brands/BrandCard";
import { useLanguage } from "@/context/LanguageContext";
import type { StorefrontBrand } from "@/actions/brands/get-brands";

type Props = {
  brands: StorefrontBrand[];
};

export function BrandsDirectoryContent({ brands }: Props) {
  const { t } = useLanguage();

  if (brands.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.03]">
        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.brandsEmpty}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t.brandsEmptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}
