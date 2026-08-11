"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  from: number;
  to: number;
  total: number;
};

export default function ProductsResultsCounter({ from, to, total }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mb-4 text-sm text-zinc-400">
      {t.showingProducts
        .replace("{from}", String(from))
        .replace("{to}", String(to))
        .replace("{total}", String(total))}
    </div>
  );
}
