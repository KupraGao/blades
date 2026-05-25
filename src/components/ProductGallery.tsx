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

      {/* ===================================== */}
      {/* MAIN IMAGE */}
      {/* ===================================== */}

      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          bg-gray-100
        "
      >

        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-cover"
        />

      </div>

      {/* ===================================== */}
      {/* GALLERY */}
      {/* ===================================== */}

      <div
        className="
          mt-4
          flex
          gap-4
          overflow-x-auto
        "
      >

        {images?.map((image) => (

          <button 
            key={image.id}
            type="button"
            aria-label="პროდუქტის ფოტო"
            onMouseEnter={() =>
              setActiveImage(image.image_url)
            }
            className="
              relative
              h-24
              w-24
              overflow-hidden
              rounded-xl
              border
              bg-gray-100
              transition
              hover:scale-105
            "
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