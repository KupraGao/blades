"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { sortProductImages } from "@/lib/products/sort-product-images";
import type { ProductImage } from "@/types/product.types";

const PRODUCT_GALLERY_ZOOM_SCALE = 2;

type ProductGalleryProps = {
  title: string;
  images: ProductImage[];
};

function canUsePointerZoom() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function originPercents(event: PointerEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = rect.width || 1;
  const height = rect.height || 1;
  const x = ((event.clientX - rect.left) / width) * 100;
  const y = ((event.clientY - rect.top) / height) * 100;

  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

export default function ProductGallery({
  title,
  images,
}: ProductGalleryProps) {
  const { t } = useLanguage();
  const orderedImages = sortProductImages(images);
  const [activeImage, setActiveImage] = useState(
    orderedImages[0]?.image_url || "/placeholder.png"
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsZoomed(false);
    const layer = zoomLayerRef.current;
    if (layer) {
      layer.style.transformOrigin = "50% 50%";
    }
  }, [activeImage]);

  function setFocalPoint(event: PointerEvent<HTMLDivElement>) {
    const { x, y } = originPercents(event);
    const layer = zoomLayerRef.current;
    if (layer) {
      layer.style.transformOrigin = `${x}% ${y}%`;
    }
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !canUsePointerZoom()) {
      return;
    }

    setFocalPoint(event);
    setIsZoomed(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !canUsePointerZoom()) {
      return;
    }

    setFocalPoint(event);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") {
      return;
    }

    setIsZoomed(false);
  }

  return (
    <div className="lg:grid lg:grid-cols-[4rem_minmax(0,1fr)] lg:items-start lg:gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 lg:col-start-2 lg:row-start-1">
        <div
          ref={zoomLayerRef}
          className="absolute inset-0"
          style={{
            transform: isZoomed
              ? `scale(${PRODUCT_GALLERY_ZOOM_SCALE})`
              : "scale(1)",
            transition: isZoomed ? "none" : "transform 150ms ease-out",
          }}
        >
          <Image
            src={activeImage}
            alt={title}
            fill
            className="object-cover"
          />
        </div>

        <div
          className="absolute inset-0 z-[1]"
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
      </div>

      <div className="mt-3 flex max-w-full gap-2 overflow-x-auto lg:col-start-1 lg:row-start-1 lg:mt-0 lg:h-0 lg:min-h-full lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
        {orderedImages.map((image) => (
          <button
            key={image.id}
            type="button"
            aria-label={t.productPhoto}
            onMouseEnter={() => setActiveImage(image.image_url)}
            onClick={() => setActiveImage(image.image_url)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-black/20 backdrop-blur transition hover:scale-105 ${
              activeImage === image.image_url
                ? "border-brand-gold"
                : "border-white/40 hover:border-white"
            }`}
          >
            <Image
              src={image.image_url}
              alt={title}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
