"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import {
  updateCustomerProfile,
  type UpdateCustomerProfileErrorKey,
} from "@/actions/account/update-customer-profile";
import type { CustomerOrderListItem } from "@/actions/orders/get-customer-orders";
import CustomerOrdersList from "@/components/account/CustomerOrdersList";
import ChangePasswordSection from "@/components/account/ChangePasswordSection";
import { logoutCustomer } from "@/actions/auth/customer-logout";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  fullName: string;
  email: string;
  phone: string;
  orders: CustomerOrderListItem[];
  isAdmin: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

export default function AccountOverview({
  fullName,
  email,
  phone,
  orders,
  isAdmin,
}: Props) {
  const { t } = useLanguage();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(false);
  const [displayFullName, setDisplayFullName] = useState(fullName);
  const [displayPhone, setDisplayPhone] = useState(phone);
  const [draftFullName, setDraftFullName] = useState(fullName);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setDisplayFullName(fullName);
    setDisplayPhone(phone);
    if (!isEditing) {
      setDraftFullName(fullName);
      setDraftPhone(phone);
    }
  }, [fullName, phone, isEditing]);

  function handleLogout() {
    startLogoutTransition(async () => {
      await logoutCustomer();
    });
  }

  function startEditing() {
    setDraftFullName(displayFullName);
    setDraftPhone(displayPhone);
    setFeedback(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftFullName(displayFullName);
    setDraftPhone(displayPhone);
    setFeedback(null);
    setIsEditing(false);
  }

  function resolveErrorMessage(errorKey: UpdateCustomerProfileErrorKey) {
    return t[errorKey];
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startSaveTransition(async () => {
      const result = await updateCustomerProfile({
        fullName: draftFullName,
        phone: draftPhone,
      });

      if (!result.success) {
        setFeedback({
          type: "error",
          message: resolveErrorMessage(result.errorKey),
        });
        return;
      }

      setDisplayFullName(result.fullName);
      setDisplayPhone(result.phone);
      setDraftFullName(result.fullName);
      setDraftPhone(result.phone);
      setIsEditing(false);
      setFeedback({
        type: "success",
        message: t.accountProfileUpdateSuccess,
      });
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
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {t.accountProfileTitle}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={startEditing}
                disabled={isLoggingOut || isSaving}
                className="shrink-0 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t.accountEditProfile}
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut || isSaving}
              className="shrink-0 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-500"
            >
              {isLoggingOut ? t.accountLogoutSubmitting : t.accountLogout}
            </button>
          </div>
        </div>

        {feedback ? (
          <p
            className={`mt-4 rounded-xl px-3 py-2 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-4 space-y-4" noValidate>
            <div>
              <label
                htmlFor="account-edit-full-name"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                {t.accountFullName}
              </label>
              <input
                id="account-edit-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={draftFullName}
                onChange={(event) => setDraftFullName(event.target.value)}
                disabled={isSaving}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="account-edit-email"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                {t.accountEmailLabel}
              </label>
              <input
                id="account-edit-email"
                name="email"
                type="email"
                value={email}
                readOnly
                disabled
                className={`${inputClassName} cursor-not-allowed opacity-70`}
              />
            </div>

            <div>
              <label
                htmlFor="account-edit-phone"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                {t.accountPhone}
              </label>
              <input
                id="account-edit-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={draftPhone}
                onChange={(event) => setDraftPhone(event.target.value)}
                disabled={isSaving}
                className={inputClassName}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? t.accountSavingProfile : t.accountSaveProfile}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {t.accountCancelEdit}
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {/* FULL NAME */}
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                {t.accountFullName}
              </dt>

              <dd className="min-w-0 text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
                {displayFullName || "—"}
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
                {displayPhone || "—"}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <ChangePasswordSection />

      {/* MY ORDERS */}
      <CustomerOrdersList orders={orders} />
    </div>
  );
}
