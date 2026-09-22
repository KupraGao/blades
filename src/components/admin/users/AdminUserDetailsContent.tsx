"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type {
  AdminCustomerDetail,
  AdminCustomerOrderSummary,
} from "@/lib/admin/admin-customers";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import {
  formatAdminDate,
  formatAdminDateTime,
} from "@/lib/i18n/format-admin-date";
import { formatOrderNumber } from "@/lib/orders/format-order-number";

const adminViewActionClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-600 bg-zinc-800 px-2.5 py-1.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400";

type Props = {
  customer: AdminCustomerDetail | null;
  orders: AdminCustomerOrderSummary[];
};

function displayName(fullName: string | null, email: string | null): string {
  if (fullName && fullName.trim()) return fullName.trim();
  if (email && email.trim()) return email.trim();
  return "—";
}

function displayValue(value: string | null | undefined): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "—";
}

function fulfillmentLabel(
  method: string | null,
  t: { fulfillmentDelivery: string; fulfillmentPickup: string },
): string {
  if (method === "delivery") return t.fulfillmentDelivery;
  if (method === "pickup") return t.fulfillmentPickup;
  return method?.trim() || "—";
}

export default function AdminUserDetailsContent({
  customer,
  orders,
}: Props) {
  const { t, language } = useLanguage();

  if (!customer) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t.adminCustomerNotFound}
        </h1>
        <p className="mt-2 text-zinc-400">
          {t.adminCustomerNotFoundDescription}
        </p>
        <Link
          href="/admin/users"
          className="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          {t.backToUsers}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/users"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            {t.backToUsers}
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            {t.adminCustomerDetails}
          </h1>
          <p className="mt-2 truncate text-zinc-400">
            {displayName(customer.fullName, customer.email)}
          </p>
        </div>

        <span className="inline-flex w-fit cursor-not-allowed rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-500 opacity-60">
          {t.accountEditProfile}
        </span>
      </div>

      {/* Profile / Account */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-white">
          {t.adminCustomerAccount}
        </h2>

        <dl className="mt-2 divide-y divide-zinc-800">
          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-400">
              {t.accountFullName}
            </dt>
            <dd className="min-w-0 text-sm font-medium text-white sm:max-w-[70%] sm:text-right">
              {displayValue(customer.fullName)}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-400">{t.email}</dt>
            <dd className="min-w-0 break-all text-sm font-medium text-white sm:max-w-[70%] sm:text-right">
              {displayValue(customer.email)}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-400">
              {t.phoneNumber}
            </dt>
            <dd className="min-w-0 text-sm font-medium text-white sm:max-w-[70%] sm:text-right">
              {displayValue(customer.phone)}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-400">{t.joined}</dt>
            <dd className="min-w-0 text-sm font-medium text-white sm:max-w-[70%] sm:text-right">
              {formatAdminDate(customer.joinedAt, language)}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-400">
              {t.emailStatus}
            </dt>
            <dd className="min-w-0 sm:max-w-[70%] sm:text-right">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  customer.emailConfirmed
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {customer.emailConfirmed
                  ? t.emailConfirmed
                  : t.emailUnconfirmed}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {/* Order History */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-white">
          {t.adminCustomerOrderHistory}
        </h2>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center">
            <p className="font-semibold text-white">
              {t.adminCustomerNoOrders}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {t.adminCustomerNoOrdersHint}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="mt-4 space-y-3 md:hidden">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold tabular-nums text-white transition hover:text-brand-orange"
                    >
                      {formatOrderNumber(order.orderNumber)}
                    </Link>
                    <OrderStatusBadge status={String(order.status ?? "")} />
                  </div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-zinc-500">{t.created}</dt>
                      <dd className="text-zinc-300">
                        {formatAdminDateTime(order.createdAt, language)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-zinc-500">
                        {t.fulfillmentMethodLabel}
                      </dt>
                      <dd className="text-zinc-300">
                        {fulfillmentLabel(order.fulfillmentMethod, t)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-zinc-500">{t.total}</dt>
                      <dd className="tabular-nums text-white">
                        ₾{order.totalPrice}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className={`mt-3 ${adminViewActionClassName}`}
                  >
                    <Eye size={15} aria-hidden />
                    {t.view}
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="px-2 py-3 font-medium">
                      {t.orderNumberColumn}
                    </th>
                    <th className="px-2 py-3 font-medium">{t.created}</th>
                    <th className="px-2 py-3 font-medium">
                      {t.statusLabel}
                    </th>
                    <th className="px-2 py-3 font-medium">
                      {t.fulfillmentMethodLabel}
                    </th>
                    <th className="px-2 py-3 font-medium">{t.total}</th>
                    <th className="px-2 py-3 text-right font-medium">
                      {t.actions}
                    </th>
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
                          {formatOrderNumber(order.orderNumber)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-zinc-300">
                        {formatAdminDateTime(order.createdAt, language)}
                      </td>
                      <td className="px-2 py-3">
                        <OrderStatusBadge
                          status={String(order.status ?? "")}
                        />
                      </td>
                      <td className="px-2 py-3 text-zinc-300">
                        {fulfillmentLabel(order.fulfillmentMethod, t)}
                      </td>
                      <td className="px-2 py-3 tabular-nums text-white">
                        ₾{order.totalPrice}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={adminViewActionClassName}
                        >
                          <Eye size={15} aria-hidden />
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
      </section>
    </div>
  );
}
