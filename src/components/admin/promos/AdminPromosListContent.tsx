"use client";

import Link from "next/link";

import DeletePromoBannerButton from "@/app/admin/(protected)/promos/DeletePromoBannerButton";
import { useLanguage } from "@/context/LanguageContext";
import { pickLocalizedText } from "@/lib/promo/localized-text";
import type { AdminPromoBanner } from "@/lib/promo/types";

type Props = {
  banners: AdminPromoBanner[];
};

const tableGridClass =
  "grid min-w-0 grid-cols-[7rem_auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-6 py-4";

function bannerTitle(
  banner: AdminPromoBanner,
  language: "ka" | "en",
  untitled: string,
) {
  return (
    pickLocalizedText(banner.title_ka, banner.title_en, language) || untitled
  );
}

function StatusBadge({
  isActive,
  activeLabel,
  inactiveLabel,
}: {
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={
        isActive
          ? "inline-flex shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400"
          : "inline-flex shrink-0 rounded-full bg-zinc-700/80 px-2.5 py-1 text-xs font-semibold text-zinc-400"
      }
    >
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}

function PosterPreview({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  if (!src) {
    return <div className={`bg-zinc-800 ${className}`} />;
  }

  return (
    <img src={src} alt={alt} className={`object-cover ${className}`} />
  );
}

export default function AdminPromosListContent({ banners }: Props) {
  const { t, language } = useLanguage();

  return (
    <div className="min-w-0">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {t.promoBanners}
          </h1>
        </div>

        <Link
          href="/admin/promos/create"
          className="shrink-0 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          {t.addPromoBanner}
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-20 text-center">
          <p className="text-lg font-semibold text-white">
            {t.noPromoBannersFound}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{t.promoBannersEmptyHint}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {banners.map((banner) => {
              const title = bannerTitle(
                banner,
                language,
                t.promoBannerUntitled,
              );

              return (
                <article
                  key={banner.id}
                  className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="aspect-[16/9] bg-zinc-950">
                    <PosterPreview
                      src={banner.imageUrl}
                      alt={title}
                      className="h-full w-full"
                    />
                  </div>

                  <div className="min-w-0 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="shrink-0 font-semibold tabular-nums text-white">
                        #{banner.sort_order}
                      </span>
                      <StatusBadge
                        isActive={banner.is_active}
                        activeLabel={t.promoBannerStatusActive}
                        inactiveLabel={t.promoBannerStatusInactive}
                      />
                    </div>

                    <p className="mt-2 min-w-0 truncate text-sm font-medium text-zinc-200">
                      {title}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/admin/promos/edit/${banner.id}`}
                        className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg bg-zinc-800 px-3 py-2 text-center text-sm text-white transition hover:bg-zinc-700"
                      >
                        {t.edit}
                      </Link>
                      <DeletePromoBannerButton
                        bannerId={banner.id}
                        stretch
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 lg:block">
            <div
              className={`${tableGridClass} border-b border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-400`}
            >
              <div>{t.image}</div>
              <div aria-hidden="true" />
              <div className="min-w-0">{t.name}</div>
              <div>{t.promoBannerStatus}</div>
              <div className="text-right">{t.actions}</div>
            </div>

            {banners.map((banner) => {
              const title = bannerTitle(
                banner,
                language,
                t.promoBannerUntitled,
              );

              return (
                <div
                  key={banner.id}
                  className={`${tableGridClass} border-b border-zinc-800 last:border-b-0`}
                >
                  <div className="w-28 shrink-0">
                    <PosterPreview
                      src={banner.imageUrl}
                      alt={title}
                      className="aspect-[16/9] w-full rounded-lg"
                    />
                  </div>

                  <div className="shrink-0 font-semibold tabular-nums text-zinc-300">
                    #{banner.sort_order}
                  </div>

                  <div className="min-w-0 font-semibold text-white">
                    <span className="block truncate">{title}</span>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge
                      isActive={banner.is_active}
                      activeLabel={t.promoBannerStatusActive}
                      inactiveLabel={t.promoBannerStatusInactive}
                    />
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2">
                    <Link
                      href={`/admin/promos/edit/${banner.id}`}
                      className="whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-2 text-sm text-white transition hover:bg-zinc-700"
                    >
                      {t.edit}
                    </Link>
                    <DeletePromoBannerButton bannerId={banner.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
