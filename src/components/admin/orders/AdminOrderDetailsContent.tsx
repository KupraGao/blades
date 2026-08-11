"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import OrderStatusActions from "@/components/admin/orders/OrderStatusActions";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";

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
        isLast ? "" : "border-b border-zinc-800"
      }`}
    >
      <span className="shrink-0 text-sm text-zinc-400">
        {label}
      </span>
      <div className="min-w-0 sm:max-w-[70%] sm:text-right">
        {children}
      </div>
    </div>
  );
}

export default function AdminOrderDetailsContent({ order }: Props) {
  const { t, language } = useLanguage();
  const locale = language === "ka" ? "ka-GE" : "en-US";

  if (!order) {
    return (
      <div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t.orderNotFound}
        </h1>

        <p className="mt-2 text-zinc-400">
          {t.orderNotFoundDescription}
        </p>

        <Link
          href="/admin/orders"
          className="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          {t.backToOrders}
        </Link>

      </div>
    );
  }

  const items = (order.order_items ?? []) as OrderItem[];
  const currentStatus = String(order.status ?? "");

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div className="min-w-0">

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t.orderDetails}
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {t.orderDetailsDescription}
          </p>

        </div>

        <Link
          href="/admin/orders"
          className="shrink-0 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          {t.backToOrders}
        </Link>

      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

        <h2 className="text-lg font-semibold text-white">
          {t.orderHeader}
        </h2>

        <div className="mt-4">

          <InfoRow label={t.orderIdLabel}>
            <p className="break-all text-sm font-semibold text-white">
              {order.id}
            </p>
          </InfoRow>

          <InfoRow label={t.created}>
            <p className="text-sm font-semibold text-white">
              {order.created_at
                ? new Date(order.created_at).toLocaleString(locale)
                : "—"}
            </p>
          </InfoRow>

          <InfoRow label={t.total}>
            <p className="text-base font-bold tabular-nums text-white">
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

      <OrderStatusActions
        orderId={order.id}
        currentStatus={currentStatus}
      />

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

        <h2 className="text-lg font-semibold text-white">
          {t.customerInformation}
        </h2>

        <div className="mt-4">

          <InfoRow label={t.name}>
            <p className="break-words text-sm font-semibold text-white">
              {order.customer_name}
            </p>
          </InfoRow>

          <InfoRow label={t.phoneNumber}>
            <p className="break-words text-sm font-semibold text-white">
              {order.customer_phone}
            </p>
          </InfoRow>

          <InfoRow label={t.email}>
            <p className="break-all text-sm font-semibold text-white">
              {order.customer_email || "—"}
            </p>
          </InfoRow>

          <InfoRow
            label={t.address}
            isLast={!order.customer_note}
          >
            <p className="break-words text-sm font-semibold text-white">
              {order.customer_address}
            </p>
          </InfoRow>

          {order.customer_note ? (
            <InfoRow label={t.customerNote} isLast>
              <p className="break-words text-sm font-semibold text-white">
                {order.customer_note}
              </p>
            </InfoRow>
          ) : null}

        </div>

      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

        <h2 className="text-lg font-semibold text-white">
          {t.orderItems}
        </h2>

        <div className="mt-4">

          {items.length === 0 ? (
            <p className="text-sm text-zinc-400">
              {t.noOrderItems}
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 py-4 ${
                  index === items.length - 1
                    ? ""
                    : "border-b border-zinc-800"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-white">
                    {item.product_title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    ₾{item.product_price} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-white">
                  ₾{item.product_price * item.quantity}
                </span>
              </div>
            ))
          )}

        </div>

        <div className="mt-1 flex items-center justify-between gap-4 border-t border-zinc-800 pt-4">
          <span className="text-base font-semibold text-white">
            {t.orderTotal}
          </span>
          <span className="text-lg font-bold tabular-nums text-white">
            ₾{order.total_price}
          </span>
        </div>

      </section>

    </div>
  );
}
