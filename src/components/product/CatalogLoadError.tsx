"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useLanguage } from "@/context/LanguageContext";

export function CatalogLoadError() {
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-zinc-300 px-6 py-12 text-center dark:border-white/15" aria-busy={pending}>
      <p role="alert" className="font-semibold">{t.catalogLoadFailed}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="mt-4 rounded-lg border border-current px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {t.catalogRetry}
      </button>
    </div>
  );
}
