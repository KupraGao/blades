"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

import { useLanguage } from "@/context/LanguageContext";
import {
  BRAND_LOGO_TOO_LARGE,
  BRAND_LOGO_UNSUPPORTED,
  BRAND_LOGO_UPLOAD_FAILED,
  isStoredBrandLogo,
} from "@/lib/brands/brand-logo-storage";
import {
  optimizeProductImage,
  ProductImageOptimizeError,
  type ProductImageOptimizeErrorCode,
} from "@/lib/products/optimize-product-image";
import { PRODUCT_IMAGE_UPLOAD_FAILED } from "@/lib/products/product-image-storage-key";

type Brand = {
  name: string;
  slug: string;
  logo: string | null;
};

type Props = {
  mode: "create" | "edit";
  brand?: Brand;
  action: (formData: FormData) => Promise<void>;
};

function optimizeErrorMessage(
  code: ProductImageOptimizeErrorCode,
  t: ReturnType<typeof useLanguage>["t"],
) {
  switch (code) {
    case "SOURCE_TOO_LARGE":
      return t.productImageSourceTooLarge;
    case "UNSUPPORTED_FORMAT":
      return t.productImageUnsupportedFormat;
    case "OPTIMIZE_FAILED":
      return t.productImageOptimizeFailed;
    case "OUTPUT_TOO_LARGE":
      return t.productImageOutputTooLarge;
    case "COMBINED_TOO_LARGE":
      return t.productImageCombinedTooLarge;
  }
}

function uploadErrorMessage(
  error: unknown,
  t: ReturnType<typeof useLanguage>["t"],
) {
  if (!(error instanceof Error)) {
    return null;
  }

  switch (error.message) {
    case BRAND_LOGO_TOO_LARGE:
    case "OUTPUT_TOO_LARGE":
      return t.productImageOutputTooLarge;
    case BRAND_LOGO_UNSUPPORTED:
    case "UNSUPPORTED_FORMAT":
      return t.productImageUnsupportedFormat;
    case BRAND_LOGO_UPLOAD_FAILED:
    case PRODUCT_IMAGE_UPLOAD_FAILED:
      return t.productImageUploadFailed;
    default:
      return null;
  }
}

export default function BrandForm({ mode, brand, action }: Props) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const currentLogo = isStoredBrandLogo(brand?.logo) ? brand.logo : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const logo = formData.get("logo");

    setSubmitting(true);

    try {
      if (logo instanceof File && logo.size > 0) {
        formData.set("logo", await optimizeProductImage(logo));
      } else {
        formData.delete("logo");
      }

      await action(formData);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof (error as { digest?: unknown }).digest === "string" &&
        (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }

      if (error instanceof ProductImageOptimizeError) {
        alert(optimizeErrorMessage(error.code, t));
        return;
      }

      const uploadMessage = uploadErrorMessage(error, t);

      if (uploadMessage) {
        alert(uploadMessage);
        return;
      }

      if (error instanceof Error && error.message) {
        alert(error.message);
        return;
      }

      alert(mode === "edit" ? t.updateBrand : t.saveBrand);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* TOP */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          {mode === "create" ? t.createBrand : t.editBrand}
        </h1>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
      >
        {/* NAME */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.brandName}
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Benchmade"
            defaultValue={brand?.name}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            required
          />
        </div>

        {/* SLUG */}
        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.slug}
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="benchmade"
            defaultValue={brand?.slug}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            required
          />
        </div>

        {/* LOGO */}
        <div>
          <label
            htmlFor="logo"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.logo}
          </label>

          {currentLogo ? (
            <Image
              src={currentLogo}
              alt=""
              width={56}
              height={56}
              className="mb-3 h-14 w-14 rounded-lg object-cover"
            />
          ) : null}

          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? t.processingImages
            : mode === "create"
              ? t.saveBrand
              : t.updateBrand}
        </button>
      </form>
    </div>
  );
}
