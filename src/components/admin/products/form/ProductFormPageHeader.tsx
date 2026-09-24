"use client";

import type { ReactNode } from "react";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  mode: "create" | "edit";
  action?: ReactNode;
};

export default function ProductFormPageHeader({ mode, action }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 lg:sticky lg:top-0 lg:z-20 lg:-mx-2 lg:border-b lg:border-zinc-800/80 lg:bg-zinc-950/95 lg:px-2 lg:py-4 lg:backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {mode === "edit" ? t.editProductTitle : t.addProductTitle}
          </h1>

          <p className="mt-2 text-zinc-400">
            {mode === "edit"
              ? t.editProductDescription
              : t.addProductDescription}
          </p>
        </div>

        {action ? (
          <div className="shrink-0 sm:pt-1">{action}</div>
        ) : null}
      </div>
    </div>
  );
}
