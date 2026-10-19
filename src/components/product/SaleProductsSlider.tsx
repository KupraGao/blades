"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCardAddToCartButton } from "@/components/product/ProductCardAddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { useLanguage } from "@/context/LanguageContext";
import { sortProductImages } from "@/lib/products/sort-product-images";
import type { SaleSliderProduct } from "@/actions/products/get-sale-slider-products";

type SaleProductsSliderProps = {
  products: SaleSliderProduct[];
};

// 1 slide below 360px, 2 until md, 3 until lg, then the 1fr column beside the 2.3fr promo.
// No whitespace before 100vw: Next.js treats a whitespace-delimited vw unit as the
// srcset floor, and " 100vw" removes every candidate below 640.
const SALE_SLIDER_IMAGE_SIZES =
  "(min-width: 1024px) calc((min(1600px,100vw) - 4rem - 296px - 1.5rem) / 3.3), (min-width: 768px) calc((min(1600px,100vw) - 3rem - 1.5rem) / 3), (min-width: 640px) calc((100vw - 3rem - 0.75rem) / 2), (min-width: 360px) calc((100vw - 2rem - 0.75rem) / 2), calc(100vw - 2rem)";

const SALE_THUMB_SIZES =
  "(min-width: 1024px) 48px, (min-width: 640px) 40px, 32px";

const GALLERY_PREVIEW_CLOSE_MS = 120;

function SaleProductCard({ product }: { product: SaleSliderProduct }) {
  const orderedImages = sortProductImages(product.product_images);
  const defaultImage =
    orderedImages.find((image) => image.is_main) || orderedImages[0];
  const [activeImage, setActiveImage] = useState(
    defaultImage?.image_url || "/placeholder.png",
  );
  const [isGalleryPreviewOpen, setIsGalleryPreviewOpen] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const galleryPreviewCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const zoomFrameRef = useRef<number | null>(null);
  const zoomInnerFrameRef = useRef<number | null>(null);
  const previewImages = orderedImages.slice(0, 3);
  const hasExtraImages = orderedImages.length > 1;

  const cancelGalleryPreviewClose = () => {
    if (galleryPreviewCloseTimeoutRef.current !== null) {
      clearTimeout(galleryPreviewCloseTimeoutRef.current);
      galleryPreviewCloseTimeoutRef.current = null;
    }
  };

  const openGalleryPreview = () => {
    cancelGalleryPreviewClose();
    setIsGalleryPreviewOpen(true);
  };

  const scheduleGalleryPreviewClose = () => {
    cancelGalleryPreviewClose();
    galleryPreviewCloseTimeoutRef.current = setTimeout(() => {
      galleryPreviewCloseTimeoutRef.current = null;
      setIsGalleryPreviewOpen(false);
    }, GALLERY_PREVIEW_CLOSE_MS);
  };

  const cancelZoomFrames = () => {
    if (zoomFrameRef.current !== null) {
      cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = null;
    }
    if (zoomInnerFrameRef.current !== null) {
      cancelAnimationFrame(zoomInnerFrameRef.current);
      zoomInnerFrameRef.current = null;
    }
  };

  const armZoom = () => {
    cancelZoomFrames();
    setImageZoomed(false);
    zoomFrameRef.current = requestAnimationFrame(() => {
      zoomFrameRef.current = null;
      zoomInnerFrameRef.current = requestAnimationFrame(() => {
        zoomInnerFrameRef.current = null;
        setImageZoomed(true);
      });
    });
  };

  useEffect(() => {
    return () => {
      if (galleryPreviewCloseTimeoutRef.current !== null) {
        clearTimeout(galleryPreviewCloseTimeoutRef.current);
      }
      cancelZoomFrames();
    };
  }, []);

  const showImage = (url: string) => {
    if (url === activeImage) return;
    setActiveImage(url);
    armZoom();
  };

  return (
    <div
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04]"
      onMouseEnter={() => armZoom()}
      onMouseLeave={() => {
        cancelZoomFrames();
        setImageZoomed(false);
      }}
    >
      <Link
        href={`/products/${product.id}`}
        className="flex min-w-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
      >
        <div
          className="relative aspect-[5/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
          onMouseEnter={hasExtraImages ? openGalleryPreview : undefined}
          onMouseLeave={hasExtraImages ? scheduleGalleryPreviewClose : undefined}
        >
          <Image
            key={activeImage}
            src={activeImage}
            alt={product.title}
            fill
            sizes={SALE_SLIDER_IMAGE_SIZES}
            className={`object-cover transition duration-1000 ease-out ${
              imageZoomed ? "scale-[1.07]" : "scale-100"
            }`}
          />
        </div>

        <div className="relative flex min-w-0 flex-col overflow-hidden p-3 pb-0 lg:p-4 lg:pb-0">
          <h3 className="display-font line-clamp-2 min-w-0 text-sm font-bold text-zinc-900 sm:text-base dark:text-white lg:text-lg">
            {product.title}
          </h3>

          <div className="mt-2 min-w-0">
            <ProductPrice product={product} size="compact" />
          </div>

          {hasExtraImages ? (
            <div
              onMouseEnter={openGalleryPreview}
              onMouseLeave={scheduleGalleryPreviewClose}
              className={`absolute inset-0 flex items-center justify-center gap-1.5 bg-white/60 backdrop-blur-[2px] transition duration-500 ease-out sm:gap-2 dark:bg-zinc-950/60 ${
                isGalleryPreviewOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-full opacity-0"
              }`}
            >
              {previewImages.map((image) => (
                <div
                  key={image.id}
                  onMouseEnter={() => showImage(image.image_url)}
                  className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-md border border-zinc-200 bg-white shadow-md transition hover:scale-110 hover:border-brand-gold sm:h-10 sm:w-10 lg:h-12 lg:w-12 lg:rounded-lg"
                >
                  <Image
                    src={image.image_url}
                    alt=""
                    fill
                    sizes={SALE_THUMB_SIZES}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="mt-3 px-3 pb-3 lg:mt-4 lg:px-4 lg:pb-4">
        <ProductCardAddToCartButton product={product} />
      </div>
    </div>
  );
}

export function SaleProductsSlider({ products }: SaleProductsSliderProps) {
  const { t } = useLanguage();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });
  const [trackedApi, setTrackedApi] = useState<typeof emblaApi>(undefined);

  const syncState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", syncState);
    emblaApi.on("reInit", syncState);

    return () => {
      emblaApi.off("select", syncState);
      emblaApi.off("reInit", syncState);
    };
  }, [emblaApi, syncState]);

  if (emblaApi && trackedApi !== emblaApi) {
    setTrackedApi(emblaApi);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }

  const showNav = canScrollPrev || canScrollNext;

  return (
    <div
      className="flex w-full min-w-0 flex-col lg:h-full"
      aria-roledescription="carousel"
      aria-label={t.sale}
    >
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3 lg:mb-4">
        <h2 className="storefront-section-heading">{t.sale}</h2>

        {showNav ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={t.previous}
              title={t.previous}
              disabled={!canScrollPrev}
              onClick={() => emblaApi?.scrollPrev()}
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition enabled:hover:border-brand-gold enabled:hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label={t.next}
              title={t.next}
              disabled={!canScrollNext}
              onClick={() => emblaApi?.scrollNext()}
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition enabled:hover:border-brand-gold enabled:hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div ref={emblaRef} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {/*
          Visible cards: 1 (<360px) → 2 (phone) → 3 (md–lg) → 1 (lg+ column).
          Inverse of a typical 1→2→3 desktop sequence because Sale is a
          narrow side column at lg and a full-width stacked row below lg.
        */}
        <div className="flex h-full min-w-0 gap-0 min-[360px]:gap-3 lg:gap-0">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-h-0 min-w-0 flex-[0_0_100%] self-stretch min-[360px]:flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_100%]"
            >
              <SaleProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
