"use client";

import { useLanguage } from "@/context/LanguageContext";

/** Shared circular header control chrome (solid, theme-aware). */
export const headerCircleControlClassName =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-800 shadow-md shadow-black/10 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-black/50 dark:hover:bg-zinc-800";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const nextLanguage = language === "ka" ? "en" : "ka";
  const label = nextLanguage === "en" ? "EN" : "KA";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={label}
      className={`${headerCircleControlClassName} text-[11px] font-bold leading-none tracking-wide`}
    >
      {label}
    </button>
  );
}
