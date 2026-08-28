"use client";

import Link from "next/link";
import { ReactNode } from "react";

import CustomerOrderProductRow from "@/components/account/CustomerOrderProductRow";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { formatStorefrontDateTime } from "@/lib/i18n/format-admin-date";
import { formatOrderNumber } from "@/lib/orders/format-order-number";

type OrderItem = {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  image_url?: string | null;
  product_href?: string | null;
};

type Props = {
  order: any | null;
};

function InfoRow({
  label,
  children,
  isLast = false,
}: {
  label: string;
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${
        isLast
          ? ""
          : "border-b border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <div className="min-w-0 sm:max-w-[70%] sm:text-right">
        {children}
      </div>
    </div>
  );
}

export default function CustomerOrderDetails({ order }: Props) {
  const { t, language } = useLanguage();

  if (!order) {
    return (
      <div className="py-6 text-center sm:py-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
          {t.accountOrderNotFound}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          {t.accountOrderNotFoundDescription}
        </p>
        <Link
          href="/account"
          className="mt-8 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.accountBackToMyAccount}
        </Link>
      </div>
    );
  }

  const items = (order.order_items ?? []) as OrderItem[];
  const currentStatus = String(order.status ?? "");
  const isPickup = order.fulfillment_method === "pickup";
  const fulfillmentLabel =
    order.fulfillment_method === "pickup"
      ? t.fulfillmentPickup
      : order.fulfillment_method === "delivery"
        ? t.fulfillmentDelivery
        : "—";

  return (
    <div className="space-y-5">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            {t.accountOrderDetails}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {formatOrderNumber(order.order_number)}
          </p>
        </div>

        <Link
          href="/account"
          className="shrink-0 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          {t.accountBackToMyAccount}
        </Link>
      </div>

      {/* ORDER HEADER */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {t.orderHeader}
          </h2>

          <span
            className={`inline-flex max-w-full items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-bold leading-snug sm:text-base ${
              isPickup
                ? "border-fuchsia-500/45 bg-fuchsia-500/15 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200"
                : order.fulfillment_method === "delivery"
                  ? "border-teal-500/45 bg-teal-500/15 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200"
                  : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
            aria-label={`${t.fulfillmentMethodLabel}: ${fulfillmentLabel}`}
          >
            {fulfillmentLabel}
          </span>
        </div>

        <div className="mt-4">
          <InfoRow label={t.orderNumberLabel}>
            <p className="text-base font-bold tabular-nums text-zinc-900 dark:text-white">
              {formatOrderNumber(order.order_number)}
            </p>
          </InfoRow>

          <InfoRow label={t.created}>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {order.created_at
                ? formatStorefrontDateTime(order.created_at, language)
                : "—"}
            </p>
          </InfoRow>

          <InfoRow label={t.total}>
            <p className="text-base font-bold tabular-nums text-zinc-900 dark:text-white">
              ₾{order.total_price}
            </p>
          </InfoRow>

          <InfoRow label={t.statusLabel} isLast>
            <div className="sm:flex sm:justify-end">
              <OrderStatusBadge status={currentStatus} />
            </div>
          </InfoRow>
        </div>
      </section>

      {/* CUSTOMER INFORMATION */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.customerInformation}
        </h2>

        <div className="mt-4">
          <InfoRow label={t.fullName}>
            <p className="break-words text-sm font-semibold text-zinc-900 dark:text-white">
              {order.customer_name}
            </p>
          </InfoRow>

          <InfoRow label={t.phoneNumber}>
            <p className="break-words text-sm font-semibold text-zinc-900 dark:text-white">
              {order.customer_phone}
            </p>
          </InfoRow>

          <InfoRow label={t.email} isLast={isPickup}>
            <p className="break-all text-sm font-semibold text-zinc-900 dark:text-white">
              {order.customer_email || "—"}
            </p>
          </InfoRow>

          {!isPickup ? (
            <InfoRow label={t.address} isLast>
              <p className="break-words text-sm font-semibold text-zinc-900 dark:text-white">
                {order.customer_address || "—"}
              </p>
            </InfoRow>
          ) : null}
        </div>
      </section>

      {/* ORDER ITEMS */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.orderItems}
        </h2>

        <div className="mt-4">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t.noOrderItems}
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 py-4 ${
                  index === items.length - 1
                    ? ""
                    : "border-b border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <CustomerOrderProductRow
                  href={item.product_href ?? null}
                  imageUrl={item.image_url ?? null}
                  title={item.product_title}
                  quantity={item.quantity}
                  priceLine={`₾${item.product_price} × ${item.quantity}`}
                  className="min-w-0 flex-1"
                />
                <span className="shrink-0 pt-1 text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
                  ₾{item.product_price * item.quantity}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-base font-semibold text-zinc-900 dark:text-white">
            {t.orderTotal}
          </span>
          <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
            ₾{order.total_price}
          </span>
        </div>
      </section>

    </div>
  );
}
