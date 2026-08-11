"use client";

import { useTransition } from "react";

import { changeMainImage } from "@/actions/products/change-main-image";
import { deleteGalleryImage } from "@/actions/products/delete-gallery-image";
import { useLanguage } from "@/context/LanguageContext";

type Product = {
  id: string;

  product_images: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
};

type ImagesSectionProps = {
  product?: Product;
};

export default function ImagesSection({ product }: ImagesSectionProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {/* PRODUCT IMAGES */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 md:p-6">
        <h2 className="mb-6 text-xl font-bold text-white">{t.productPhoto}</h2>

        {/* არსებული ფოტოები */}
        {product && product.product_images.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-medium text-zinc-300">
              {t.existingPhotos}
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {product.product_images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/30"
                >
                  <img
                    src={image.image_url}
                    alt={t.productPhoto}
                    className="h-40 w-full object-cover"
                  />

                  {image.is_main ? (
                    <div className="bg-green-600 px-3 py-2 text-center text-xs font-bold text-white">
                      {t.mainPhoto}
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await changeMainImage(product.id, image.id);
                          })
                        }
                        className="w-full bg-zinc-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
                      >
                        {isPending ? t.uploading : t.setAsMain}
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await deleteGalleryImage(image.id);
                          })
                        }
                        className="w-full border-t border-zinc-700 bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {isPending ? t.uploading : t.deletePhoto}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* MAIN IMAGE */}
          <div>
            <label
              htmlFor="mainImage"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              {t.mainPhoto}
            </label>

            <input
              id="mainImage"
              type="file"
              name="mainImage"
              accept="image/*"
              title={t.mainPhoto}
              className="w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-white"
            />
          </div>

          {/* GALLERY IMAGES */}
          <div>
            <label
              htmlFor="galleryImages"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              {t.galleryPhotos}
            </label>

            <input
              id="galleryImages"
              type="file"
              name="galleryImages"
              multiple
              accept="image/*"
              title={t.galleryPhotos}
              className="w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}
