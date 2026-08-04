"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageSwitcher() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("ka")}
        className={`
          rounded-lg
          px-3 py-1.5
          text-sm font-bold
          transition

          ${
            language === "ka"
              ? "bg-brand-gold text-black"
              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }
        `}
      >
        KA
      </button>

      <button
        onClick={() => setLanguage("en")}
        className={`
          rounded-lg
          px-3 py-1.5
          text-sm font-bold
          transition

          ${
            language === "en"
              ? "bg-brand-gold text-black"
              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }
        `}
      >
        EN
      </button>
    </div>
  );
}