"use client";

import { useState, type FormEvent } from "react";

import { useLanguage } from "@/context/LanguageContext";
import {
  optimizeProductImage,
  ProductImageOptimizeError,
  type ProductImageOptimizeErrorCode,
} from "@/lib/products/optimize-product-image";
import type { AdminPromoBanner } from "@/lib/promo/types";

type Props = {
  mode: "create" | "edit";
  banner?: AdminPromoBanner;
  action: (formData: FormData) => Promise<void>;
};

function optimizeErrorMessage(
  code: ProductImageOptimizeErrorCode,
  t: ReturnType<typeof useLanguage>["t"],
) {
  switch (code) {
    case "SOURCE_TOO_LARGE":
      return t.promoBannerImageSourceTooLarge;
    case "UNSUPPORTED_FORMAT":
      return t.promoBannerImageUnsupportedFormat;
    case "OPTIMIZE_FAILED":
      return t.promoBannerImageOptimizeFailed;
    case "OUTPUT_TOO_LARGE":
      return t.promoBannerImageOutputTooLarge;
    case "COMBINED_TOO_LARGE":
      return t.promoBannerImageOutputTooLarge;
  }
}

function actionErrorMessage(
  error: unknown,
  t: ReturnType<typeof useLanguage>["t"],
) {
  if (!(error instanceof Error)) {
    return t.promoBannerSaveFailed;
  }

  switch (error.message) {
    case "promoBannerImageRequired":
      return t.promoBannerImageRequired;
    case "promoBannerInvalidLink":
      return t.promoBannerInvalidLink;
    case "promoBannerUploadFailed":
      return t.promoBannerUploadFailed;
    case "promoBannerImageTooLarge":
      return t.promoBannerImageOutputTooLarge;
    case "promoBannerUnsupportedImage":
      return t.promoBannerImageUnsupportedFormat;
    case "promoBannerNotFound":
      return t.promoBannerNotFound;
    case "promoBannersLoadFailed":
      return t.promoBannersLoadFailed;
    case "promoBannerSaveFailed":
      return t.promoBannerSaveFailed;
    default:
      return error.message || t.promoBannerSaveFailed;
  }
}

export default function PromoBannerForm({ mode, banner, action }: Props) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const image = formData.get("image");

    setSubmitting(true);

    try {
      if (image instanceof File && image.size > 0 && image.name) {
        formData.set("image", await optimizeProductImage(image));
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

      alert(actionErrorMessage(error, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          {mode === "create" ? t.createPromoBanner : t.editPromoBanner}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <div>
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.promoBannerImage}
            {mode === "create" ? " *" : ""}
          </label>

          {mode === "edit" && banner?.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={t.promoBannerCurrentImage}
              className="mb-4 h-40 w-full max-w-xl rounded-xl object-cover"
            />
          ) : null}

          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={mode === "create"}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black"
          />
          <p className="mt-2 text-xs text-zinc-500">{t.promoBannerImageHint}</p>
        </div>

        <div>
          <p className="mb-4 text-xs text-zinc-500">
            {t.promoBannerOverlayOptionalHint}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="title_ka"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              {t.promoBannerTitleKa}
            </label>
            <input
              id="title_ka"
              name="title_ka"
              type="text"
              maxLength={120}
              defaultValue={banner?.title_ka ?? ""}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="title_en"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              {t.promoBannerTitleEn}
            </label>
            <input
              id="title_en"
              name="title_en"
              type="text"
              maxLength={120}
              defaultValue={banner?.title_en ?? ""}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="subtitle_ka"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              {t.promoBannerSubtitleKa}
            </label>
            <input
              id="subtitle_ka"
              name="subtitle_ka"
              type="text"
              maxLength={200}
              defaultValue={banner?.subtitle_ka ?? ""}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="subtitle_en"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              {t.promoBannerSubtitleEn}
            </label>
            <input
              id="subtitle_en"
              name="subtitle_en"
              type="text"
              maxLength={200}
              defaultValue={banner?.subtitle_en ?? ""}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="link_url"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.promoBannerLinkUrl}
          </label>
          <input
            id="link_url"
            name="link_url"
            type="text"
            placeholder="/delivery"
            defaultValue={banner?.link_url ?? ""}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
          />
          <p className="mt-2 text-xs text-zinc-500">{t.promoBannerLinkHint}</p>
        </div>

        <div>
          <label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={banner?.is_active ?? true}
              className="h-4 w-4 accent-white"
            />
            {t.promoBannerActive}
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {submitting
            ? t.saving
            : mode === "create"
              ? t.savePromoBanner
              : t.updatePromoBanner}
        </button>
      </form>
    </div>
  );
}
