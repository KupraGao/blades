"use client";

import Link from "next/link";

import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import type { DashboardStatusCount } from "@/actions/admin/get-admin-dashboard-data";

type Props = {
  statusCounts: DashboardStatusCount[];
};

export default function DashboardStatusOverview({ statusCounts }: Props) {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-white">
        {t.dashboardOrderStatusOverview}
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        {t.dashboardOrderStatusOverviewHint}
      </p>

      <ul className="mt-5 divide-y divide-zinc-800">
        {statusCounts.map(({ status, count }) => (
          <li key={status}>
            <Link
              href={`/admin/orders?status=${status}`}
              className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-zinc-800/60"
            >
              <OrderStatusBadge status={status} />
              <span className="tabular-nums text-sm font-semibold text-white">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
