"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";

const PRODUCT_GALLERY_ZOOM_SCALE = 2;

type ProductImage = {
  id: string;
  image_url: string;
  is_main: boolean;
};

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
  const [activeImage, setActiveImage] = useState(
    images?.[0]?.image_url || "/placeholder.png"
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
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
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

        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {images?.map((image) => (
            <button
              key={image.id}
              type="button"
              aria-label={t.productPhoto}
              onMouseEnter={() => setActiveImage(image.image_url)}
              className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/40 bg-black/20 backdrop-blur transition hover:scale-105 hover:border-white"
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
    </div>
  );
}
