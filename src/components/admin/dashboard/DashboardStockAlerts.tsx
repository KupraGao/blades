"use client";

import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";
import type { DashboardStockAlertItem } from "@/actions/admin/get-admin-dashboard-data";

type Props = {
  outOfStockCount: number;
  lowStockCount: number;
  stockAlerts: DashboardStockAlertItem[];
};

export default function DashboardStockAlerts({
  outOfStockCount,
  lowStockCount,
  stockAlerts,
}: Props) {
  const { t } = useLanguage();
  const hasAlerts = outOfStockCount > 0 || lowStockCount > 0;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">
          {t.dashboardStockAlerts}
        </h2>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-300 transition hover:text-white"
        >
          {t.viewAllArrow}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs text-zinc-400">{t.dashboardOutOfStock}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-red-400">
            {outOfStockCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs text-zinc-400">{t.dashboardLowStock}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-300">
            {lowStockCount}
          </p>
        </div>
      </div>

      {!hasAlerts ? (
        <p className="mt-5 text-sm text-zinc-400">
          {t.dashboardStockLevelsGood}
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-zinc-800">
          {stockAlerts.map((product) => {
            const isOut = product.stock <= 0;

            return (
              <li key={product.id}>
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="flex items-start justify-between gap-3 py-2.5 transition hover:bg-zinc-800/60"
                >
                  <span className="min-w-0 break-words text-sm font-medium text-white">
                    {product.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                      isOut
                        ? "bg-red-500/20 text-red-400"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {isOut
                      ? t.dashboardOutOfStock
                      : `${t.dashboardLowStock}: ${product.stock}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
