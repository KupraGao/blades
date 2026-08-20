"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { registerCustomer } from "@/actions/auth/customer-register";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function CustomerRegisterForm() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resolveError(
    errorKey:
      | "accountAuthFullNameRequired"
      | "accountAuthFullNameMin"
      | "accountAuthPhoneRequired"
      | "accountAuthPhoneInvalid"
      | "accountAuthInvalidEmail"
      | "accountAuthPasswordRequired"
      | "accountAuthPasswordTooShort"
      | "accountAuthPasswordMismatch"
      | "accountAuthEmailTaken"
      | "accountAuthRegisterFailed",
  ) {
    switch (errorKey) {
      case "accountAuthFullNameRequired":
        return t.accountAuthFullNameRequired;
      case "accountAuthFullNameMin":
        return t.accountAuthFullNameMin;
      case "accountAuthPhoneRequired":
        return t.accountAuthPhoneRequired;
      case "accountAuthPhoneInvalid":
        return t.accountAuthPhoneInvalid;
      case "accountAuthInvalidEmail":
        return t.accountAuthInvalidEmail;
      case "accountAuthPasswordRequired":
        return t.accountAuthPasswordRequired;
      case "accountAuthPasswordTooShort":
        return t.accountAuthPasswordTooShort;
      case "accountAuthPasswordMismatch":
        return t.accountAuthPasswordMismatch;
      case "accountAuthEmailTaken":
        return t.accountAuthEmailTaken;
      default:
        return t.accountAuthRegisterFailed;
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNeedsConfirmation(false);

    startTransition(async () => {
      const result = await registerCustomer({
        fullName,
        phone,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setError(resolveError(result.errorKey));
        return;
      }

      if (result.requiresEmailConfirmation) {
        setNeedsConfirmation(true);
      }
    });
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t.accountAuthConfirmRequiredTitle}
        </h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t.accountAuthConfirmRequiredDescription}
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

  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t.accountRegisterTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.accountRegisterDescription}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="customer-register-full-name"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountFullName}
          </label>
          <input
            id="customer-register-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={isPending}
            className={inputClassName}
            placeholder={t.placeholderFullName}
          />
        </div>

        <div>
          <label
            htmlFor="customer-register-phone"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountPhone}
          </label>
          <input
            id="customer-register-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={isPending}
            className={inputClassName}
            placeholder={t.placeholderPhone}
          />
        </div>

        <div>
          <label
            htmlFor="customer-register-email"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountEmail}
          </label>
          <input
            id="customer-register-email"
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
            htmlFor="customer-register-password"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountPassword}
          </label>
          <input
            id="customer-register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="customer-register-confirm"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t.accountConfirmPassword}
          </label>
          <input
            id="customer-register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {isPending
            ? t.accountRegisterSubmitting
            : t.accountRegisterSubmit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t.accountHaveAccount}{" "}
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
