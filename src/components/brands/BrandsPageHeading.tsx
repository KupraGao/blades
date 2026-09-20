"use client";

import { useLanguage } from "@/context/LanguageContext";

export function BrandsPageHeading() {
  const { t } = useLanguage();

  return (
    <header className="max-w-2xl">
      <p className="small-label">{t.brands}</p>
      <h1 className="section-title mt-2">{t.brandsDirectoryTitle}</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
        {t.brandsDirectorySubtitle}
      </p>
    </header>
  );
}
