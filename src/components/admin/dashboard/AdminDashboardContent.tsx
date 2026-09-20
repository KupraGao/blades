"use client";

import DashboardKpiRow from "@/components/admin/dashboard/DashboardKpiRow";
import DashboardRecentOrders from "@/components/admin/dashboard/DashboardRecentOrders";
import DashboardSalesChart from "@/components/admin/dashboard/DashboardSalesChart";
import DashboardStatusOverview from "@/components/admin/dashboard/DashboardStatusOverview";
import DashboardStockAlerts from "@/components/admin/dashboard/DashboardStockAlerts";
import { useLanguage } from "@/context/LanguageContext";
import type { AdminDashboardData } from "@/actions/admin/get-admin-dashboard-data";

type Props = {
  data: AdminDashboardData;
};

function formatGel(amount: number): string {
  const rounded =
    Math.round((Number.isFinite(amount) ? amount : 0) * 100) / 100;
  return `₾${rounded}`;
}

export default function AdminDashboardContent({ data }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t.dashboard}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{t.dashboardSubtitle}</p>
      </div>

      <DashboardKpiRow
        productCount={data.productCount}
        totalOrderCount={data.totalOrderCount}
        thisMonthOrderCount={data.thisMonthOrderCount}
        thisMonthSalesLabel={formatGel(data.thisMonthSales)}
      />

      <DashboardSalesChart series={data.salesLast30Days} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardStatusOverview statusCounts={data.statusCounts} />
        <DashboardStockAlerts
          outOfStockCount={data.outOfStockCount}
          lowStockCount={data.lowStockCount}
          stockAlerts={data.stockAlerts}
        />
      </div>

      <DashboardRecentOrders orders={data.recentOrders} />
    </div>
  );
}
