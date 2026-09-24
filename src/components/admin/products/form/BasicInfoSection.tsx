"use client";

import { useState } from "react";

import { useLanguage } from "@/context/LanguageContext";
import {
  getProductDiscountPercent,
  isProductOnSale,
} from "@/lib/products/pricing";

type Brand = {
  id: number;
  name: string;
};

type Product = {
  title: string;
  brand_id: number | null;
  price: number;
  sale_price?: number | null;
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
  const [onSale, setOnSale] = useState(() =>
    isProductOnSale({
      price: product?.price ?? 0,
      sale_price: product?.sale_price ?? null,
    }),
  );
  const [regularPrice, setRegularPrice] = useState(
    product?.price != null ? String(product.price) : "",
  );
  const [salePrice, setSalePrice] = useState(
    product?.sale_price != null ? String(product.sale_price) : "",
  );

  const discountPercent = onSale
    ? getProductDiscountPercent({
        price: Number(regularPrice),
        sale_price: salePrice === "" ? null : Number(salePrice),
      })
    : null;

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
        <div className="grid gap-5 md:col-span-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)] md:items-end">
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
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              placeholder="320"
              title={t.price}
              className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </div>

          <label className="block w-fit cursor-pointer">
            <span className="mb-2 hidden text-sm font-medium text-zinc-300 md:block">
              {t.onSale}
            </span>

            <span className="flex min-h-[3.25rem] items-center gap-3 text-sm font-medium text-zinc-300">
              <input
                id="onSale"
                name="onSale"
                type="checkbox"
                checked={onSale}
                onChange={(event) => setOnSale(event.target.checked)}
                className="h-4 w-4 accent-white"
              />
              <span className="md:hidden">{t.onSale}</span>
            </span>
          </label>

          {onSale ? (
            <div>
              <label
                htmlFor="salePrice"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                {t.salePrice}
              </label>

              <div className="flex min-w-0 items-center gap-3">
                <input
                  id="salePrice"
                  type="number"
                  name="salePrice"
                  value={salePrice}
                  onChange={(event) => setSalePrice(event.target.value)}
                  min="0"
                  step="any"
                  required
                  placeholder="280"
                  title={t.salePrice}
                  className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
                />

                {discountPercent !== null && discountPercent > 0 ? (
                  <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                    -{discountPercent}%
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
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
