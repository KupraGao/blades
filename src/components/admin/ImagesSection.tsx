"use client";

export default function ImagesSection() {
  return (
    <>
      {/* PRODUCT IMAGES */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

        <h2 className="mb-6 text-xl font-bold text-white">
          პროდუქტის ფოტოები
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          {/* MAIN IMAGE */}
          <div>

            <label
              htmlFor="mainImage"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              მთავარი ფოტო
            </label>

            <input id="mainImage" type="file" name="mainImage" accept="image/*" title="მთავარი ფოტო"
              className="w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-white"
            />

          </div>

          {/* GALLERY IMAGES */}
          <div>

            <label
              htmlFor="galleryImages"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              გალერიის ფოტოები
            </label>

            <input id="galleryImages" type="file" name="galleryImages" multiple accept="image/*" title="გალერიის ფოტოები"
              className="w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}