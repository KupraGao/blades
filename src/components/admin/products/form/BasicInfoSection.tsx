"use client";

import { useLanguage } from "@/context/LanguageContext";

type Brand = {
  id: number;
  name: string;
};

type Product = {
  title: string;
  brand_id: number | null;
  price: number;
  review_link: string | null;
  stock: number;
};

type BasicInfoSectionProps = {
  brands: Brand[];
  product?: Product;
};

export default function BasicInfoSection({
  brands,
  product,
}: BasicInfoSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 md:p-6">
      <h2 className="mb-6 text-xl font-bold text-white">{t.basicInfo}</h2>

      <div className="grid gap-5 md:grid-cols-2">
        {/* TITLE */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.productTitleLabel}
          </label>

          <input
            id="title"
            type="text"
            name="title"
            defaultValue={product?.title}
            placeholder="Spyderco Paramilitary 2"
            title={t.productTitleLabel}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BRAND */}
        <div>
          <label
            htmlFor="brandId"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.brands}
          </label>

          <select
            id="brandId"
            name="brandId"
            defaultValue={product?.brand_id ?? ""}
            title={t.selectBrand}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          >
            <option value="">{t.selectBrand}</option>

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRICE */}
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.price}
          </label>

          <input
            id="price"
            type="number"
            name="price"
            defaultValue={product?.price}
            placeholder="320"
            title={t.price}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* REVIEW LINK */}
        <div>
          <label
            htmlFor="reviewLink"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.reviewLink}
          </label>

          <input
            id="reviewLink"
            type="text"
            name="reviewLink"
            defaultValue={product?.review_link ?? ""}
            placeholder="https://youtube.com/watch?v=..."
            title={t.reviewLink}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* STOCK */}
        <div>
          <label
            htmlFor="stock"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.stock}
          </label>

          <input
            id="stock"
            type="number"
            name="stock"
            defaultValue={product?.stock}
            placeholder="15"
            title={t.stock}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>
      </div>
    </div>
  );
}
