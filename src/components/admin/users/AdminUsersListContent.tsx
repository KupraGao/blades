"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import type { AdminCustomerListItem } from "@/lib/admin/admin-customers";
import AdminUsersPagination from "@/components/admin/users/AdminUsersPagination";
import AdminUsersSearch from "@/components/admin/users/AdminUsersSearch";
import { useLanguage } from "@/context/LanguageContext";
import { formatAdminDate } from "@/lib/i18n/format-admin-date";

const adminViewActionClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-600 bg-zinc-800 px-2.5 py-1.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400";

type Props = {
  customers: AdminCustomerListItem[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasSearch: boolean;
  failed: boolean;
};

function displayName(fullName: string | null, email: string | null): string {
  if (fullName && fullName.trim()) return fullName.trim();
  if (email && email.trim()) return email.trim();
  return "—";
}

function displayPhone(phone: string | null): string {
  if (phone && phone.trim()) return phone.trim();
  return "—";
}

export default function AdminUsersListContent({
  customers,
  total,
  totalPages,
  page,
  pageSize,
  hasSearch,
  failed,
}: Props) {
  const { t, language } = useLanguage();

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">{t.users}</h1>
      </div>

      <div className="mb-6">
        <AdminUsersSearch />
      </div>

      {failed ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <h2 className="text-2xl font-bold text-white">
            {t.adminUsersLoadFailed}
          </h2>
          <p className="mt-2 text-zinc-400">{t.adminUsersLoadFailedHint}</p>
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <h2 className="text-2xl font-bold text-white">
            {hasSearch ? t.noUsersMatchSearch : t.noUsersYet}
          </h2>
          <p className="mt-2 text-zinc-400">
            {hasSearch ? t.tryChangingSearch : t.usersWillAppear}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-400">
            {t.showingUsers
              .replace("{from}", String(from))
              .replace("{to}", String(to))
              .replace("{total}", String(total))}
          </p>

          {/* Mobile cards */}
          <div className="space-y-4 lg:hidden">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold text-white">
                      {displayName(customer.fullName, customer.email)}
                    </h2>
                    <p className="mt-1 break-all text-sm text-zinc-400">
                      {customer.email || "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      customer.emailConfirmed
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {customer.emailConfirmed
                      ? t.emailConfirmed
                      : t.emailUnconfirmed}
                  </span>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">{t.phoneNumber}</dt>
                    <dd className="text-right text-zinc-200">
                      {displayPhone(customer.phone)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">{t.joined}</dt>
                    <dd className="text-right text-zinc-200">
                      {formatAdminDate(customer.joinedAt, language)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-zinc-800 pt-3">
                  <Link
                    href={`/admin/users/${customer.id}`}
                    className={adminViewActionClassName}
                  >
                    <Eye size={15} aria-hidden />
                    {t.view}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900 lg:block">
            <div className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr_100px] border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400">
              <div>{t.customer}</div>
              <div>{t.email}</div>
              <div>{t.phoneNumber}</div>
              <div>{t.joined}</div>
              <div>{t.emailStatus}</div>
              <div className="text-right">{t.actions}</div>
            </div>

            {customers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr_100px] items-center border-b border-zinc-800 px-6 py-4"
              >
                <div className="min-w-0 pr-3 font-medium text-white">
                  <span className="line-clamp-2">
                    {displayName(customer.fullName, customer.email)}
                  </span>
                </div>
                <div className="min-w-0 break-all pr-3 text-sm text-zinc-300">
                  {customer.email || "—"}
                </div>
                <div className="pr-3 text-sm text-zinc-300">
                  {displayPhone(customer.phone)}
                </div>
                <div className="pr-3 text-sm text-zinc-300">
                  {formatAdminDate(customer.joinedAt, language)}
                </div>
                <div className="pr-3">
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
                </div>
                <div className="text-right">
                  <Link
                    href={`/admin/users/${customer.id}`}
                    className={adminViewActionClassName}
                  >
                    <Eye size={15} aria-hidden />
                    {t.view}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <AdminUsersPagination
            currentPage={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
