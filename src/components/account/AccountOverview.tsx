"use client";

import Link from "next/link";
import { useTransition } from "react";

import { logoutCustomer } from "@/actions/auth/customer-logout";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  fullName: string;
  email: string;
  phone: string;
};

export default function AccountOverview({
  fullName,
  email,
  phone,
}: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutCustomer();
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {t.accountMyAccount}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t.accountOverviewDescription}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <dl className="space-y-4 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">
              {t.accountFullName}
            </dt>
            <dd className="font-semibold text-zinc-900 dark:text-white sm:text-right">
              {fullName || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">
              {t.accountEmailLabel}
            </dt>
            <dd className="break-all font-semibold text-zinc-900 dark:text-white sm:text-right">
              {email || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">
              {t.accountPhone}
            </dt>
            <dd className="font-semibold text-zinc-900 dark:text-white sm:text-right">
              {phone || "—"}
            </dd>
          </div>
        </dl>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
          {t.accountMyOrdersComingSoon}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {t.accountBackToStore}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
          >
            {isPending ? t.accountLogoutSubmitting : t.accountLogout}
          </button>
        </div>
      </div>
    </div>
  );
}
