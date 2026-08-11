"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";

type OrderRow = {
  id: string;
  customer_name: string;
  total_price: number | string;
  status: string | null;
  created_at: string;
};

type Props = {
  orders: OrderRow[];
};

export default function AdminOrdersListContent({ orders }: Props) {
  const { t, language } = useLanguage();
  const locale = language === "ka" ? "ka-GE" : "en-US";

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

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

          <h2 className="text-2xl font-bold text-white">
            {t.noOrdersYet}
          </h2>

          <p className="mt-2 text-zinc-400">
            {t.ordersWillAppear}
          </p>

        </div>
      ) : (
        <>

          <div className="space-y-4 sm:hidden">

            {orders.map((order) => (

              <div
                key={order.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <h2 className="min-w-0 break-words font-semibold text-white">
                    {order.customer_name}
                  </h2>

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
                      {new Date(order.created_at).toLocaleDateString(locale)}
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

          <div className="hidden overflow-hidden rounded-2xl border border-zinc-800 sm:block">

            <table className="w-full table-fixed">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="p-4 text-left text-sm font-semibold text-zinc-300">
                    {t.customer}
                  </th>

                  <th className="w-28 p-4 text-left text-sm font-semibold text-zinc-300">
                    {t.total}
                  </th>

                  <th className="w-36 p-4 text-left text-sm font-semibold text-zinc-300">
                    {t.statusLabel}
                  </th>

                  <th className="w-32 p-4 text-left text-sm font-semibold text-zinc-300">
                    {t.dateLabel}
                  </th>

                  <th className="w-28 p-4 text-right text-sm font-semibold text-zinc-300">
                    {t.actions}
                  </th>

                </tr>

              </thead>

              <tbody>

                {orders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-t border-zinc-800"
                  >

                    <td className="p-4">
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
                      {new Date(order.created_at).toLocaleDateString(locale)}
                    </td>

                    <td className="p-4 text-right">
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

        </>
      )}

    </div>
  );
}
