"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  mode: "create" | "edit";
};

export default function ProductFormPageHeader({ mode }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white">
        {mode === "edit" ? t.editProductTitle : t.addProductTitle}
      </h1>

      <p className="mt-2 text-zinc-400">
        {mode === "edit" ? t.editProductDescription : t.addProductDescription}
      </p>
    </div>
  );
}
