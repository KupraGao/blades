"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import { requestPasswordReset } from "@/actions/auth/request-password-reset";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  initialErrorKey?: "accountAuthRecoveryLinkFailed" | null;
};

export default function ForgotPasswordForm({
  initialErrorKey = null,
}: Props) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    initialErrorKey ? t[initialErrorKey] : null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        setError(
          result.errorKey === "accountAuthInvalidEmail"
            ? t.accountAuthInvalidEmail
            : t.accountForgotPasswordFailed,
        );
        return;
      }

      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t.accountForgotPasswordTitle}
        </h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t.accountForgotPasswordSent}
        </p>
        <Link
          href="/account/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.accountGoToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t.accountForgotPasswordTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.accountForgotPasswordDescription}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="customer-forgot-email"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountEmail}
          </label>
          <input
            id="customer-forgot-email"
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
            ? t.accountForgotPasswordSubmitting
            : t.accountForgotPasswordSubmit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/account/login"
          className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-white"
        >
          {t.accountGoToLogin}
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
