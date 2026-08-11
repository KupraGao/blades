"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ProductNotFoundMessage() {
  const { t } = useLanguage();

  return (
    <h1 className="text-3xl font-bold">
      {t.productNotFound}
    </h1>
  );
}
