"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboardPage() {
  const { t } = useLanguage();

  return (
    <>
      <h2 className="mb-6 text-4xl font-bold text-white">{t.dashboard}</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg text-zinc-400">{t.products}</h3>
          <p className="mt-4 text-4xl font-bold text-white">0</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg text-zinc-400">{t.categories}</h3>
          <p className="mt-4 text-4xl font-bold text-white">0</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg text-zinc-400">{t.orders}</h3>
          <p className="mt-4 text-4xl font-bold text-white">0</p>
        </div>

      </div>
    </>
  );
}
