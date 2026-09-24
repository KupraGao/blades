"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function PromoBannerNotFound() {
  const { t } = useLanguage();

  return (
    <h1 className="text-2xl font-bold text-white">{t.promoBannerNotFound}</h1>
  );
}
