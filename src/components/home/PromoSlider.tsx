"use client";

import { useLanguage } from "@/context/LanguageContext";

type PromoSliderProps = {
  /** Stretch to the grid row when Sale slider is beside this frame. */
  fillHeight?: boolean;
};

export function PromoSlider({ fillHeight = false }: PromoSliderProps) {
  const { t } = useLanguage();

  return (
    <div
      role="region"
      aria-label={t.promoBanner}
      className={`relative w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 ${
        fillHeight
          ? "aspect-[16/9] lg:aspect-auto lg:h-full"
          : "aspect-[16/9]"
      }`}
    >
      {/*
        Future image-first slide:
        relative overflow-hidden + img/Image fill object-cover.
        Overlay Prev/Next will sit left/right; optional dots at the bottom.
        Multiple real banners will be passed in a later CMS task.
      */}
      <div className="pointer-events-none absolute inset-0 flex min-w-0 flex-col items-center justify-center gap-1 px-4 text-center">
        <p className="max-w-full min-w-0 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          {t.promoBanner}
        </p>
        <p className="max-w-full min-w-0 text-xs text-zinc-500 dark:text-zinc-500">
          {t.promoBannerAdminHint}
        </p>
      </div>
    </div>
  );
}
