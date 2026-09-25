"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

import {
  changeCustomerPassword,
  type ChangeCustomerPasswordErrorKey,
} from "@/actions/account/change-customer-password";
import { useLanguage } from "@/context/LanguageContext";

const inputClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

const toggleButtonClassName =
  "absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition hover:text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200";

export default function ChangePasswordSection() {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetDrafts() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  function startEditing() {
    resetDrafts();
    setFeedback(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    resetDrafts();
    setFeedback(null);
    setIsEditing(false);
  }

  function resolveError(errorKey: ChangeCustomerPasswordErrorKey) {
    return t[errorKey];
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await changeCustomerPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        setFeedback({
          type: "error",
          message: resolveError(result.errorKey),
        });
        return;
      }

      resetDrafts();
      setIsEditing(false);
      setFeedback({
        type: "success",
        message: t.accountChangePasswordSuccess,
      });
    });
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.accountSecurityTitle}
        </h2>

        {!isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            disabled={isPending}
            className="shrink-0 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t.accountChangePassword}
          </button>
        ) : null}
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label
              htmlFor="account-change-current-password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              {t.accountCurrentPassword}
            </label>
            <div className="relative">
              <input
                id="account-change-current-password"
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isPending}
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((visible) => !visible)}
                disabled={isPending}
                aria-label={
                  showCurrent ? t.accountHidePassword : t.accountShowPassword
                }
                title={
                  showCurrent ? t.accountHidePassword : t.accountShowPassword
                }
                className={toggleButtonClassName}
              >
                {showCurrent ? (
                  <EyeOff size={18} aria-hidden />
                ) : (
                  <Eye size={18} aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="account-change-new-password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              {t.accountNewPassword}
            </label>
            <div className="relative">
              <input
                id="account-change-new-password"
                name="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isPending}
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowNew((visible) => !visible)}
                disabled={isPending}
                aria-label={
                  showNew ? t.accountHidePassword : t.accountShowPassword
                }
                title={showNew ? t.accountHidePassword : t.accountShowPassword}
                className={toggleButtonClassName}
              >
                {showNew ? (
                  <EyeOff size={18} aria-hidden />
                ) : (
                  <Eye size={18} aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="account-change-confirm-password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              {t.accountConfirmNewPassword}
            </label>
            <div className="relative">
              <input
                id="account-change-confirm-password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isPending}
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((visible) => !visible)}
                disabled={isPending}
                aria-label={
                  showConfirm ? t.accountHidePassword : t.accountShowPassword
                }
                title={
                  showConfirm ? t.accountHidePassword : t.accountShowPassword
                }
                className={toggleButtonClassName}
              >
                {showConfirm ? (
                  <EyeOff size={18} aria-hidden />
                ) : (
                  <Eye size={18} aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? t.accountChangePasswordSubmitting
                : t.accountChangePasswordSubmit}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isPending}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {t.accountCancelEdit}
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t.accountPassword}
            </dt>
            <dd className="min-w-0 text-sm font-semibold text-zinc-900 dark:text-white sm:max-w-[70%] sm:text-right">
              {t.accountPasswordMasked}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
