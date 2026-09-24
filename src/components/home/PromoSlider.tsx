"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { pickLocalizedText } from "@/lib/promo/localized-text";
import { isInternalAppPath } from "@/lib/promo/validate-link-url";
import type { StorefrontPromoBanner } from "@/lib/promo/types";

export const PROMO_AUTOPLAY_INTERVAL_MS = 5000;

type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

type PromoSliderProps = {
  banners: StorefrontPromoBanner[];
  /** Stretch to the grid row when Sale slider is beside this frame. */
  fillHeight?: boolean;
};

function frameClass(fillHeight: boolean) {
  return fillHeight
    ? "aspect-[16/9] lg:aspect-auto lg:h-full"
    : "aspect-[16/9]";
}

function BannerSlide({
  banner,
  fillHeight,
  language,
  accessibleName,
  reserveDots = false,
}: {
  banner: StorefrontPromoBanner;
  fillHeight: boolean;
  language: "ka" | "en";
  accessibleName: string;
  reserveDots?: boolean;
}) {
  const title = pickLocalizedText(banner.title_ka, banner.title_en, language);
  const subtitle = pickLocalizedText(
    banner.subtitle_ka,
    banner.subtitle_en,
    language,
  );
  const href =
    banner.link_url && isInternalAppPath(banner.link_url)
      ? banner.link_url
      : null;

  const media = (
    <>
      <img
        src={banner.imageUrl}
        alt={href ? "" : title || ""}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {title || subtitle ? (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pt-12 sm:px-6 ${
            reserveDots ? "pb-10 sm:pb-12" : "pb-5 sm:pb-6"
          }`}
        >
          {title ? (
            <p className="max-w-xl font-serif text-lg font-bold text-white sm:text-2xl">
              {title}
            </p>
          ) : null}
          {subtitle ? (
            <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const className = `relative block w-full min-w-0 overflow-hidden ${frameClass(fillHeight)}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50`}
        aria-label={accessibleName}
      >
        {media}
      </Link>
    );
  }

  return <div className={className}>{media}</div>;
}

export function PromoSlider({
  banners,
  fillHeight = false,
}: PromoSliderProps) {
  const { t, language } = useLanguage();

  if (banners.length === 0) {
    return null;
  }

  const slideName = (banner: StorefrontPromoBanner) =>
    pickLocalizedText(banner.title_ka, banner.title_en, language) ||
    t.promoBanner;

  const surface = `relative w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 ${frameClass(fillHeight)}`;

  if (banners.length === 1) {
    return (
      <div role="region" aria-label={t.promoBanner} className={surface}>
        <BannerSlide
          banner={banners[0]}
          fillHeight={fillHeight}
          language={language}
          accessibleName={slideName(banners[0])}
        />
      </div>
    );
  }

  return (
    <PromoCarousel
      key={banners.map((banner) => banner.id).join("-")}
      banners={banners}
      fillHeight={fillHeight}
      surface={surface}
    />
  );
}

function PromoCarousel({
  banners,
  fillHeight,
  surface,
}: {
  banners: StorefrontPromoBanner[];
  fillHeight: boolean;
  surface: string;
}) {
  const { t, language } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [autoplayReady, setAutoplayReady] = useState(false);
  const [interactionNonce, setInteractionNonce] = useState(0);

  const timerRef = useRef<number | null>(null);
  const emblaApiRef = useRef<EmblaApi | undefined>(undefined);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    watchDrag: true,
  });

  emblaApiRef.current = emblaApi;

  const syncState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const bumpInteraction = useCallback(() => {
    setInteractionNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    syncState();
    emblaApi.on("select", syncState);
    emblaApi.on("reInit", syncState);

    return () => {
      emblaApi.off("select", syncState);
      emblaApi.off("reInit", syncState);
    };
  }, [emblaApi, syncState]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      setPrefersReducedMotion(media.matches);
      setAutoplayReady(true);
    };

    syncMotion();
    media.addEventListener("change", syncMotion);

    return () => {
      media.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    const syncVisibility = () => {
      setDocumentHidden(document.hidden);
    };

    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const autoplayPaused =
    !autoplayReady ||
    prefersReducedMotion ||
    hovering ||
    focused ||
    documentHidden;

  const bannerIds = banners.map((banner) => banner.id).join("-");

  useEffect(() => {
    clearTimer();

    if (!emblaApi || autoplayPaused) {
      return clearTimer;
    }

    timerRef.current = window.setTimeout(() => {
      emblaApiRef.current?.scrollNext();
    }, PROMO_AUTOPLAY_INTERVAL_MS);

    return clearTimer;
  }, [
    emblaApi,
    autoplayPaused,
    selectedIndex,
    interactionNonce,
    bannerIds,
    clearTimer,
  ]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const slideName = (banner: StorefrontPromoBanner) =>
    pickLocalizedText(banner.title_ka, banner.title_en, language) ||
    t.promoBanner;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t.promoBanner}
      className={surface}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) {
          return;
        }
        setFocused(false);
      }}
    >
      <div ref={emblaRef} className="h-full min-h-0 min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="min-h-0 min-w-0 flex-[0_0_100%] self-stretch"
            >
              <BannerSlide
                banner={banner}
                fillHeight={fillHeight}
                language={language}
                accessibleName={slideName(banner)}
                reserveDots
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label={t.previous}
        title={t.previous}
        onClick={() => {
          emblaApi?.scrollPrev();
          bumpInteraction();
        }}
        className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white transition hover:border-brand-gold hover:text-brand-gold"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        aria-label={t.next}
        title={t.next}
        onClick={() => {
          emblaApi?.scrollNext();
          bumpInteraction();
        }}
        className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white transition hover:border-brand-gold hover:text-brand-gold"
      >
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
        {banners.map((banner, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={banner.id}
              type="button"
              aria-label={t.promoBannerGoToSlide.replace(
                "{n}",
                String(index + 1),
              )}
              aria-current={selected ? "true" : undefined}
              onClick={() => {
                emblaApi?.scrollTo(index);
                bumpInteraction();
              }}
              className={`h-2.5 w-2.5 rounded-full transition ${
                selected ? "bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
