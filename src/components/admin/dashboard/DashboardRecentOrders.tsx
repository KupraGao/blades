"use client";

import Link from "next/link";

import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { formatAdminDateTime } from "@/lib/i18n/format-admin-date";
import { formatOrderNumber } from "@/lib/orders/format-order-number";
import type { DashboardRecentOrder } from "@/actions/admin/get-admin-dashboard-data";

type Props = {
  orders: DashboardRecentOrder[];
};

function fulfillmentLabel(
  method: string | null,
  t: { fulfillmentDelivery: string; fulfillmentPickup: string },
): string {
  if (method === "delivery") return t.fulfillmentDelivery;
  if (method === "pickup") return t.fulfillmentPickup;
  return method?.trim() || "—";
}

export default function DashboardRecentOrders({ orders }: Props) {
  const { t, language } = useLanguage();

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t.dashboardRecentOrders}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {t.dashboardRecentOrdersHint}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-zinc-300 transition hover:text-white"
        >
          {t.viewArrow}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-4 py-10 text-center">
          <p className="font-medium text-white">{t.dashboardNoRecentOrders}</p>
          <p className="mt-1 text-sm text-zinc-400">{t.ordersWillAppear}</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-zinc-300">
                      {formatOrderNumber(order.order_number)}
                    </p>
                    <p className="mt-1 break-words font-medium text-white">
                      {order.customer_name}
                    </p>
                  </div>
                  <OrderStatusBadge
                    status={String(order.status ?? "")}
                    className="shrink-0"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-zinc-500">{t.total}</p>
                    <p className="font-medium text-white">
                      ₾{order.total_price}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">{t.fulfillmentMethodLabel}</p>
                    <p className="font-medium text-white">
                      {fulfillmentLabel(order.fulfillment_method, t)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-zinc-500">{t.created}</p>
                    <p className="font-medium text-white">
                      {formatAdminDateTime(order.created_at, language)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="px-2 py-3 font-medium">{t.orderNumberColumn}</th>
                  <th className="px-2 py-3 font-medium">{t.customer}</th>
                  <th className="px-2 py-3 font-medium">{t.total}</th>
                  <th className="px-2 py-3 font-medium">{t.statusLabel}</th>
                  <th className="px-2 py-3 font-medium">
                    {t.fulfillmentMethodLabel}
                  </th>
                  <th className="px-2 py-3 font-medium">{t.created}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/40">
                    <td className="px-2 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold tabular-nums text-white transition hover:text-brand-orange"
                      >
                        {formatOrderNumber(order.order_number)}
                      </Link>
                    </td>
                    <td className="max-w-[12rem] truncate px-2 py-3 text-white">
                      {order.customer_name}
                    </td>
                    <td className="px-2 py-3 tabular-nums text-white">
                      ₾{order.total_price}
                    </td>
                    <td className="px-2 py-3">
                      <OrderStatusBadge status={String(order.status ?? "")} />
                    </td>
                    <td className="px-2 py-3 text-zinc-300">
                      {fulfillmentLabel(order.fulfillment_method, t)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-zinc-300">
                      {formatAdminDateTime(order.created_at, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
