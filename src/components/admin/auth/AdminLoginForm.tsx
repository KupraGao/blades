"use client";

import { useState, useTransition } from "react";

import { loginWithPassword } from "@/actions/auth/login";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLoginForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginWithPassword(email, password);

      // Successful login redirects on the server (never returns here).
      if (!result.success) {
        setError(
          result.errorKey === "adminLoginFailed"
            ? t.adminLoginFailed
            : t.adminLoginInvalidCredentials,
        );
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-400">
              {t.adminPanel}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {t.adminLoginTitle}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {t.adminLoginDescription}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-medium text-zinc-200"
            >
              {t.adminLoginEmail}
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60"
              placeholder={t.placeholderEmail}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-zinc-200"
            >
              {t.adminLoginPassword}
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? t.adminLoginSubmitting : t.adminLoginSubmit}
          </button>
        </form>
      </div>
    </div>
  );
}
