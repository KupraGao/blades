"use client";

import { useLanguage } from "@/context/LanguageContext";

type Kpi = {
  label: string;
  value: string;
};

type Props = {
  productCount: number;
  totalOrderCount: number;
  thisMonthOrderCount: number;
  thisMonthSalesLabel: string;
};

export default function DashboardKpiRow({
  productCount,
  totalOrderCount,
  thisMonthOrderCount,
  thisMonthSalesLabel,
}: Props) {
  const { t } = useLanguage();

  const items: Kpi[] = [
    { label: t.dashboardKpiProducts, value: String(productCount) },
    { label: t.dashboardKpiTotalOrders, value: String(totalOrderCount) },
    {
      label: t.dashboardKpiThisMonthOrders,
      value: String(thisMonthOrderCount),
    },
    { label: t.dashboardKpiThisMonthSales, value: thisMonthSalesLabel },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"
        >
          <h3 className="text-sm font-medium text-zinc-400">{item.label}</h3>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-white">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
