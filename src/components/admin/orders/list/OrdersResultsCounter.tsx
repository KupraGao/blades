"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  from: number;
  to: number;
  total: number;
};

export default function OrdersResultsCounter({ from, to, total }: Props) {
  const { t } = useLanguage();

  if (total === 0) {
    return null;
  }

  return (
    <div className="mb-4 text-sm text-zinc-400">
      {t.showingOrders
        .replace("{from}", String(from))
        .replace("{to}", String(to))
        .replace("{total}", String(total))}
    </div>
  );
}
