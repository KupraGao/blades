"use client";

import { useLanguage } from "@/context/LanguageContext";

type ProductDetailsContentProps = {
  label: keyof typeof import("@/dictionaries/ka").ka;
};

export default function ProductDetailsContent({
  label,
}: ProductDetailsContentProps) {
  const { t } = useLanguage();

  return <>{t[label]}</>;
}