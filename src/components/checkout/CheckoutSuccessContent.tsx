"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedOrderStatus } from "@/lib/i18n/localize-storefront-message";

type OrderItem = {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
};

type Props = {
  order: any | null;
};

export default function CheckoutSuccessContent({ order }: Props) {
  const { t, language } = useLanguage();
  const locale = language === "ka" ? "ka-GE" : "en-US";

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">{t.orderNotFound}</h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          {t.orderNotFoundDescription}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  const items = (order.order_items ?? []) as OrderItem[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">

      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-green-600">
          {t.orderConfirmed}
        </p>
        <h1 className="mt-2 text-4xl font-bold">
          {t.thankYouForOrder}
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          {t.orderPlacedSuccessfully}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.orderIdLabel}
            </span>
            <span className="break-all text-right font-medium">
              {order.id}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.statusLabel}
            </span>
            <span className="font-medium">
              {getLocalizedOrderStatus(String(order.status ?? ""), t)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.dateLabel}
            </span>
            <span className="font-medium">
              {order.created_at
                ? new Date(order.created_at).toLocaleString(locale)
                : "—"}
            </span>
          </div>
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <h2 className="text-lg font-bold">{t.customerInformation}</h2>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.fullName}
            </span>
            <span className="text-right font-medium">
              {order.customer_name}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.phoneNumber}
            </span>
            <span className="text-right font-medium">
              {order.customer_phone}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.email}
            </span>
            <span className="break-all text-right font-medium">
              {order.customer_email || "—"}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.address}
            </span>
            <span className="max-w-[70%] text-right font-medium">
              {order.customer_address}
            </span>
          </div>
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <h2 className="text-lg font-bold">{t.orderItems}</h2>

        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t.noOrderItems}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.product_title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    ₾{item.product_price} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-medium">
                  ₾{item.product_price * item.quantity}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <div className="flex items-center justify-between text-lg font-bold">
          <span>{t.total}</span>
          <span>₾{order.total_price}</span>
        </div>

      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.continueShopping}
        </Link>
      </div>

    </div>
  );
}
