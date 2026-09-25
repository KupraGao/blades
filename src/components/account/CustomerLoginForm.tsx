"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

import { loginCustomer } from "@/actions/auth/customer-login";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  initialErrorKey?: "accountAuthConfirmLinkFailed" | null;
  showSignedOutMessage?: boolean;
  nextPath?: string;
};

export default function CustomerLoginForm({
  initialErrorKey = null,
  showSignedOutMessage = false,
  nextPath = "/account",
}: Props) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    initialErrorKey === "accountAuthConfirmLinkFailed"
      ? t.accountAuthConfirmLinkFailed
      : null,
  );
  const [isPending, startTransition] = useTransition();
  const nextQuery =
    nextPath && nextPath !== "/account"
      ? `?next=${encodeURIComponent(nextPath)}`
      : "";

  function resolveError(
    errorKey:
      | "accountAuthInvalidEmail"
      | "accountAuthPasswordRequired"
      | "accountAuthEmailNotConfirmed"
      | "accountAuthInvalidCredentials"
      | "accountAuthLoginFailed",
  ) {
    switch (errorKey) {
      case "accountAuthInvalidEmail":
        return t.accountAuthInvalidEmail;
      case "accountAuthPasswordRequired":
        return t.accountAuthPasswordRequired;
      case "accountAuthEmailNotConfirmed":
        return t.accountAuthEmailNotConfirmed;
      case "accountAuthLoginFailed":
        return t.accountAuthLoginFailed;
      default:
        return t.accountAuthInvalidCredentials;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginCustomer(email, password, nextPath);

      if (!result.success) {
        setError(resolveError(result.errorKey));
      }
    });
  }

  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";

  const passwordToggleLabel = showPassword
    ? t.accountHidePassword
    : t.accountShowPassword;

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t.accountLoginTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.accountLoginDescription}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {showSignedOutMessage ? (
        <p
          className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          role="status"
        >
          {t.accountSignedOutSuccess}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="customer-login-email"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountEmail}
          </label>
          <input
            id="customer-login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            className={inputClassName}
            placeholder={t.placeholderEmail}
          />
        </div>

        <div>
          <label
            htmlFor="customer-login-password"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountPassword}
          </label>
          <div className="relative">
            <input
              id="customer-login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
          <div className="mt-2 flex justify-end">
            <Link
              href="/account/forgot-password"
              className="text-sm font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              {t.accountForgotPassword}
            </Link>
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
          {isPending ? t.accountLoginSubmitting : t.accountLoginSubmit}
        </button>
      </form>

      <div
        className="my-6 flex items-center gap-3"
        role="separator"
        aria-label={t.accountOr}
      >
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {t.accountOr}
        </span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <div className="space-y-3">
        <Link
          href={`/account/register${nextQuery}`}
          className="flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-center font-semibold text-zinc-900 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
        >
          {t.accountGoToRegister}
        </Link>

        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-center text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
        >
          {t.accountContinueAsGuest}
        </Link>
      </div>
    </div>
  );
}
