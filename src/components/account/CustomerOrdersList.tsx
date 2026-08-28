"use client";

import Link from "next/link";

import type { CustomerOrderListItem } from "@/actions/orders/get-customer-orders";
import CustomerOrderProductRow from "@/components/account/CustomerOrderProductRow";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { formatStorefrontDateTime } from "@/lib/i18n/format-admin-date";
import { formatOrderNumber } from "@/lib/orders/format-order-number";

type Props = {
  orders: CustomerOrderListItem[];
};

export default function CustomerOrdersList({ orders }: Props) {
  const { t, language } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white sm:text-xl">
            {t.accountMyOrders}
          </h2>
          {orders.length > 0 ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountMyOrdersCount.replace(
                "{count}",
                String(orders.length),
              )}
            </p>
          ) : null}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.accountMyOrdersEmpty}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const isPickup = order.fulfillment_method === "pickup";
            const fulfillmentLabel =
              order.fulfillment_method === "pickup"
                ? t.fulfillmentPickup
                : order.fulfillment_method === "delivery"
                  ? t.fulfillmentDelivery
                  : "—";

            return (
              <li
                key={order.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
                        {formatOrderNumber(order.order_number)}
                      </p>
                      <OrderStatusBadge status={String(order.status ?? "")} />
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          isPickup
                            ? "border-fuchsia-500/45 bg-fuchsia-500/15 text-fuchsia-800 dark:text-fuchsia-200"
                            : order.fulfillment_method === "delivery"
                              ? "border-teal-500/45 bg-teal-500/15 text-teal-800 dark:text-teal-200"
                              : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {fulfillmentLabel}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {order.created_at
                        ? formatStorefrontDateTime(order.created_at, language)
                        : "—"}
                    </p>

                    {(() => {
                      const items = order.order_items ?? [];
                      const visibleItems = items.slice(0, 2);
                      const remaining = items.length - visibleItems.length;

                      if (visibleItems.length === 0) {
                        return null;
                      }

                      return (
                        <ul className="space-y-2">
                          {visibleItems.map((item, index) => (
                            <li key={`${order.id}-item-${index}`}>
                              <CustomerOrderProductRow
                                href={item.product_href}
                                imageUrl={item.image_url}
                                title={item.product_title}
                                quantity={item.quantity}
                              />
                            </li>
                          ))}
                          {remaining > 0 ? (
                            <li className="pl-[3.75rem] text-sm text-zinc-500 dark:text-zinc-400">
                              {t.accountMyOrdersMoreItems.replace(
                                "{count}",
                                String(remaining),
                              )}
                            </li>
                          ) : null}
                        </ul>
                      );
                    })()}

                    <p className="text-base font-bold tabular-nums text-zinc-900 dark:text-white">
                      ₾{order.total_price}
                    </p>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
                  >
                    {t.accountViewOrderDetails}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
