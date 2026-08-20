"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { loginCustomer } from "@/actions/auth/customer-login";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  initialErrorKey?: "accountAuthConfirmLinkFailed" | null;
};

export default function CustomerLoginForm({
  initialErrorKey = null,
}: Props) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialErrorKey === "accountAuthConfirmLinkFailed"
      ? t.accountAuthConfirmLinkFailed
      : null,
  );
  const [isPending, startTransition] = useTransition();

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginCustomer(email, password);

      if (!result.success) {
        setError(resolveError(result.errorKey));
      }
    });
  }

  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
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
          <input
            id="customer-login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            className={inputClassName}
          />
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

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t.accountNoAccount}{" "}
        <Link
          href="/account/register"
          className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-white"
        >
          {t.accountGoToRegister}
        </Link>
      </p>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          {t.accountBackToStore}
        </Link>
      </div>
    </div>
  );
}
