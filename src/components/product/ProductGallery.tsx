"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  id: string;
  image_url: string;
  is_main: boolean;
};

type ProductGalleryProps = {
  title: string;
  images: ProductImage[];
};

export default function ProductGallery({
  title,
  images,
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(
    images?.[0]?.image_url || "/placeholder.png"
  );

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-cover"
        />

        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {images?.map((image) => (
            <button
              key={image.id}
              type="button"
              aria-label="პროდუქტის ფოტო"
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