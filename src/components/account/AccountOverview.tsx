"use client";

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
};

export default function AccountOverview({
  fullName,
  email,
  phone,
  orders,
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
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
          {t.accountMyAccount}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t.accountOverviewDescription}
        </p>
      </div>

      {/* PROFILE */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {t.accountProfileTitle}
          </h2>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="shrink-0 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isPending ? t.accountLogoutSubmitting : t.accountLogout}
          </button>
        </div>

        <dl className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountFullName}
            </dt>
            <dd className="min-w-0 text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
              {fullName || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountEmailLabel}
            </dt>
            <dd className="min-w-0 break-all text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
              {email || "—"}
            </dd>
          </div>

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
