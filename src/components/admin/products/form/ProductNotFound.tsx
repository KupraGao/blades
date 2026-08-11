"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ProductNotFound() {
  const { t } = useLanguage();

  return (
    <h1 className="text-2xl font-bold text-white">{t.productNotFound}</h1>
  );
}
