"use client";

import Link from "next/link";
import { useTransition } from "react";

import type { CustomerOrderListItem } from "@/actions/orders/get-customer-orders";
import CustomerOrdersList from "@/components/account/CustomerOrdersList";
import { logoutCustomer } from "@/actions/auth/customer-logout";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  fullName: string;
  email: string;
  phone: string;
  orders: CustomerOrderListItem[];
  isAdmin: boolean;
};

export default function AccountOverview({
  fullName,
  email,
  phone,
  orders,
  isAdmin,
}: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutCustomer();
    });
  }

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* TITLE + DESCRIPTION */}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            {t.accountMyAccount}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.accountOverviewDescription}
          </p>
        </div>

        {/* ADMIN PANEL — ONLY FOR ADMIN */}
        {isAdmin && (
          <Link
            href="/admin"
            className="inline-flex w-fit self-start shrink-0 items-center justify-center rounded-xl bg-brand-orange px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            {t.accountAdminPanel}
          </Link>
        )}
      </div>

      {/* PROFILE */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {t.accountProfileTitle}
          </h2>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="shrink-0 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-500"
          >
            {isPending ? t.accountLogoutSubmitting : t.accountLogout}
          </button>
        </div>

        <dl className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          {/* FULL NAME */}
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountFullName}
            </dt>

            <dd className="min-w-0 text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
              {fullName || "—"}
            </dd>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountEmailLabel}
            </dt>

            <dd className="min-w-0 break-all text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
              {email || "—"}
            </dd>
          </div>

          {/* PHONE */}
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountPhone}
            </dt>

            <dd className="min-w-0 text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
              {phone || "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* MY ORDERS */}
      <CustomerOrdersList orders={orders} />
    </div>
  );
}