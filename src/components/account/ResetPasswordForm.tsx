"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

import {
  updateCustomerPassword,
  type UpdateCustomerPasswordResult,
} from "@/actions/auth/update-customer-password";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function ResetPasswordForm() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";

  function resolveError(
    errorKey: Extract<
      UpdateCustomerPasswordResult,
      { success: false }
    >["errorKey"],
  ) {
    switch (errorKey) {
      case "accountResetPasswordUnauthorized":
        return t.accountResetPasswordUnauthorized;
      case "accountAuthPasswordRequired":
        return t.accountAuthPasswordRequired;
      case "accountAuthPasswordTooShort":
        return t.accountAuthPasswordTooShort;
      case "accountAuthPasswordMismatch":
        return t.accountAuthPasswordMismatch;
      default:
        return t.accountResetPasswordFailed;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateCustomerPassword({
        password,
        confirmPassword,
      });

      if (!result.success) {
        setError(resolveError(result.errorKey));
        return;
      }

      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t.accountResetPasswordSuccessTitle}
        </h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t.accountResetPasswordSuccessDescription}
        </p>
        <Link
          href="/account"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.accountMyAccount}
        </Link>
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/account/login"
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-white"
          >
            {t.accountGoToLogin}
          </Link>
        </p>
      </div>
    );
  }

  const passwordToggleLabel = showPassword
    ? t.accountHidePassword
    : t.accountShowPassword;
  const confirmPasswordToggleLabel = showConfirmPassword
    ? t.accountHidePassword
    : t.accountShowPassword;

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t.accountResetPasswordTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.accountResetPasswordDescription}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="customer-reset-password"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountNewPassword}
          </label>
          <div className="relative">
            <input
              id="customer-reset-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={isPending}
              aria-label={passwordToggleLabel}
              title={passwordToggleLabel}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition hover:text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden />
              ) : (
                <Eye size={18} aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="customer-reset-confirm"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountConfirmNewPassword}
          </label>
          <div className="relative">
            <input
              id="customer-reset-confirm"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isPending}
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              disabled={isPending}
              aria-label={confirmPasswordToggleLabel}
              title={confirmPasswordToggleLabel}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition hover:text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} aria-hidden />
              ) : (
                <Eye size={18} aria-hidden />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {isPending
            ? t.accountResetPasswordSubmitting
            : t.accountResetPasswordSubmit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/account/forgot-password"
          className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-white"
        >
          {t.accountForgotPassword}
        </Link>
      </p>
    </div>
  );
}
