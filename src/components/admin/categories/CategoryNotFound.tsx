"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function CategoryNotFound() {
  const { t } = useLanguage();

  return (
    <h1 className="text-2xl font-bold text-white">{t.categoryNotFound}</h1>
  );
}
