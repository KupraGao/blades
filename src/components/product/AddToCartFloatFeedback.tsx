"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  count: number;
  visible: boolean;
  exiting: boolean;
  /** Absolute placement classes (e.g. bottom-full right-0). */
  className?: string;
};

export function AddToCartFloatFeedback({
  count,
  visible,
  exiting,
  className = "bottom-full right-0 mb-2",
}: Props) {
  const { t } = useLanguage();

  if (!visible || count < 1) {
    return null;
  }

  const label =
    count === 1
      ? t.addedToCartOnce
      : t.addedToCartCount.replace("{count}", String(count));

  return (
    <span
      className={`pointer-events-none absolute z-20 ${className}`}
      aria-hidden={false}
    >
      <span
        role="status"
        aria-live="polite"
        className={`inline-block whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-900 shadow-md transition duration-200 ease-out dark:border-white/15 dark:bg-zinc-950 dark:text-white ${
          exiting
            ? "translate-y-1 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
