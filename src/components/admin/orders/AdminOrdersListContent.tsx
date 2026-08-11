"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { formatAdminDate } from "@/lib/i18n/format-admin-date";
import { formatOrderNumber } from "@/lib/orders/format-order-number";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import OrdersPagination from "@/components/admin/orders/list/OrdersPagination";
import OrdersResultsCounter from "@/components/admin/orders/list/OrdersResultsCounter";
import OrdersToolbar from "@/components/admin/orders/list/OrdersToolbar";

type OrderRow = {
  id: string;
  order_number?: number | string | null;
  customer_name: string;
  total_price: number | string;
  status: string | null;
  created_at: string;
};

type Props = {
  orders: OrderRow[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasActiveFilters: boolean;
};

export default function AdminOrdersListContent({
  orders,
  total,
  totalPages,
  page,
  limit,
  hasActiveFilters,
}: Props) {
  const { t, language } = useLanguage();

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(page * limit, total);

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          {t.orders}
        </h1>

        <p className="mt-2 text-zinc-400">
          {t.manageCustomerOrders}
        </p>

      </div>

      <OrdersToolbar />

      {total === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

          <h2 className="text-2xl font-bold text-white">
            {hasActiveFilters ? t.noOrdersMatchFilters : t.noOrdersYet}
          </h2>

          <p className="mt-2 text-zinc-400">
            {hasActiveFilters ? t.tryChangingFilters : t.ordersWillAppear}
          </p>

        </div>
      ) : (
        <>

          <OrdersResultsCounter
            from={from}
            to={to}
            total={total}
          />

          <div className="space-y-4 sm:hidden">

            {orders.map((order) => (

              <div
                key={order.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-zinc-300">
                      {formatOrderNumber(order.order_number)}
                    </p>
                    <h2 className="mt-1 break-words font-semibold text-white">
                      {order.customer_name}
                    </h2>
                  </div>

                  <OrderStatusBadge
                    status={String(order.status ?? "")}
                    className="shrink-0"
                  />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                  <div className="min-w-0">
                    <p className="text-zinc-500">
                      {t.total}
                    </p>
                    <p className="font-medium text-white">
                      ₾{order.total_price}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-zinc-500">
                      {t.dateLabel}
                    </p>
                    <p className="font-medium text-white">
                      {formatAdminDate(order.created_at, language)}
                    </p>
                  </div>

                </div>

                <div className="mt-4 flex justify-end">

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
                  >
                    {t.viewArrow}
                  </Link>

                </div>

              </div>

            ))}

          </div>

          <div className="hidden sm:block">

            <div className="overflow-x-auto rounded-2xl border border-zinc-800">

              <table className="w-full min-w-[44rem] table-fixed">

                <thead className="bg-zinc-900">

                  <tr>

                    <th className="w-24 whitespace-nowrap p-4 text-left text-sm font-semibold text-zinc-300">
                      {t.orderNumberLabel}
                    </th>

                    <th className="min-w-[9rem] p-4 text-left text-sm font-semibold text-zinc-300">
                      {t.customer}
                    </th>

                    <th className="w-24 whitespace-nowrap p-4 text-left text-sm font-semibold text-zinc-300">
                      {t.total}
                    </th>

                    <th className="w-32 whitespace-nowrap p-4 text-left text-sm font-semibold text-zinc-300">
                      {t.statusLabel}
                    </th>

                    <th className="w-28 whitespace-nowrap p-4 text-left text-sm font-semibold text-zinc-300">
                      {t.dateLabel}
                    </th>

                    <th className="w-24 whitespace-nowrap py-4 pl-4 pr-5 text-right text-sm font-semibold text-zinc-300">
                      {t.ordersAction}
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {orders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-t border-zinc-800"
                    >

                      <td className="whitespace-nowrap p-4 font-semibold tabular-nums text-white">
                        {formatOrderNumber(order.order_number)}
                      </td>

                      <td className="max-w-0 p-4">
                        <span className="block truncate font-medium text-white">
                          {order.customer_name}
                        </span>
                      </td>

                      <td className="whitespace-nowrap p-4 text-white">
                        ₾{order.total_price}
                      </td>

                      <td className="p-4">
                        <OrderStatusBadge
                          status={String(order.status ?? "")}
                        />
                      </td>

                      <td className="whitespace-nowrap p-4 text-zinc-300">
                        {formatAdminDate(order.created_at, language)}
                      </td>

                      <td className="py-4 pl-4 pr-5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
                        >
                          {t.view}
                        </Link>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          <OrdersPagination
            currentPage={page}
            totalPages={totalPages}
          />

        </>
      )}

    </div>
  );
}
