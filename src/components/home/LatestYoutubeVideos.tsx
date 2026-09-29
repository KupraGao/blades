"use client";

import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { formatAdminDate } from "@/lib/i18n/format-admin-date";
import type { LatestYoutubeVideo } from "@/lib/youtube/fetch-latest-videos";

const CHANNEL_URL = "https://www.youtube.com/@Bladesge";

function YoutubeBrandMark() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="17"
      viewBox="0 0 24 17"
      className="shrink-0"
    >
      <rect width="24" height="17" rx="4" fill="#FF0000" />
      <path d="M9.25 4.2v8.6L16.75 8.5Z" fill="#fff" />
    </svg>
  );
}

function YoutubeChannelLink({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <a
      href={CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
      <ArrowRight size={16} />
    </a>
  );
}

function YoutubeVideoCard({
  video,
  watchLabel,
  dateLabel,
  isActive,
  onPlay,
}: {
  video: LatestYoutubeVideo;
  watchLabel: string;
  dateLabel: string;
  isActive: boolean;
  onPlay: (videoId: string) => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
      <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-900">
        {isActive ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => onPlay(video.videoId)}
            aria-label={`${watchLabel}: ${video.title}`}
            className="group relative h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold/70"
          >
            <img
              src={video.thumbnail}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/20">
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-zinc-900 dark:text-white sm:text-base">
          {video.title}
        </h3>
        {dateLabel && dateLabel !== "—" ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{dateLabel}</p>
        ) : null}
      </div>
    </article>
  );
}

export function LatestYoutubeVideos({
  videos,
}: {
  videos: LatestYoutubeVideo[];
}) {
  const { t, language } = useLanguage();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const channelLinkClass =
    "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-gold transition hover:opacity-80";

  return (
    <section className="py-12">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="small-label flex items-center gap-2">
              {t.youtubeEyebrow}
              <YoutubeBrandMark />
            </p>
            <h2 className="storefront-section-heading mt-3">
              {t.youtubeHeading}
            </h2>
            <p className="section-subtitle">{t.youtubeBody}</p>
          </div>

          <YoutubeChannelLink
            label={t.youtubeChannelCta}
            className={`${channelLinkClass} shrink-0`}
          />
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <YoutubeVideoCard
                key={video.videoId}
                video={video}
                watchLabel={t.youtubeWatchVideo}
                dateLabel={formatAdminDate(video.published, language)}
                isActive={activeVideoId === video.videoId}
                onPlay={setActiveVideoId}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
