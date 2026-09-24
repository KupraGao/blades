"use client";

import { useRef, useState } from "react";

import { createProduct } from "@/actions/products/create-product";
import { updateProduct } from "@/actions/products/update-product";

import BasicInfoSection from "@/components/admin/products/form/BasicInfoSection";
import CategoriesSection from "@/components/admin/products/form/CategoriesSection";
import SpecificationsSection from "@/components/admin/products/form/SpecificationsSection";
import ImagesSection from "@/components/admin/products/form/ImagesSection";
import { useLanguage } from "@/context/LanguageContext";
import {
  PRODUCT_IMAGE_COMBINED_OPTIMIZED_MAX_BYTES,
  optimizeProductImage,
  ProductImageOptimizeError,
  type ProductImageOptimizeErrorCode,
} from "@/lib/products/optimize-product-image";
import { PRODUCT_IMAGE_UPLOAD_FAILED } from "@/lib/products/product-image-storage-key";

type Brand = {
  id: number;
  name: string;
};

type Category = {
  id: string;
  name_ka: string;
  name_en: string;
};

type Product = {
  id: string;
  title: string;
  brand_id: number | null;
  price: number;
  review_link: string | null;
  stock: number;
  overall_length: string | null;
  blade_length: string | null;
  blade_thickness: string | null;
  blade_steel: string | null;
  handle_material: string | null;
  locking_type: string | null;
  knife_type: string | null;
  weight: string | null;

  product_categories: {
    category_id: string;
  }[];

  product_images: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
};

type ProductFormProps = {
  brands: Brand[];
  categories: Category[];
  mode?: "create" | "edit";
  product?: Product;
};

type SubmitPhase = "idle" | "processing" | "saving";

function isNewImageFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0 && Boolean(value.name);
}

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

export default function ProductForm({
  brands,
  categories,
  mode = "create",
  product,
}: ProductFormProps) {
  const { t } = useLanguage();
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const submitLockRef = useRef(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitPhase("processing");

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });

      const optimizedFormData = new FormData();

      for (const [key, value] of formData.entries()) {
        if (key === "mainImage" || key === "galleryImages") {
          continue;
        }

        optimizedFormData.append(key, value);
      }

      const mainImage = formData.get("mainImage");

      if (isNewImageFile(mainImage)) {
        optimizedFormData.set(
          "mainImage",
          await optimizeProductImage(mainImage),
        );
      }

      const galleryImages = formData
        .getAll("galleryImages")
        .filter(isNewImageFile);

      for (const image of galleryImages) {
        optimizedFormData.append(
          "galleryImages",
          await optimizeProductImage(image),
        );
      }

      let optimizedImagesTotal = 0;
      const optimizedMainImage = optimizedFormData.get("mainImage");

      if (optimizedMainImage instanceof File) {
        optimizedImagesTotal += optimizedMainImage.size;
      }

      for (const image of optimizedFormData.getAll("galleryImages")) {
        if (image instanceof File) {
          optimizedImagesTotal += image.size;
        }
      }

      if (optimizedImagesTotal > PRODUCT_IMAGE_COMBINED_OPTIMIZED_MAX_BYTES) {
        throw new ProductImageOptimizeError("COMBINED_TOO_LARGE");
      }

      // =================================================
      // FORMDATA DEBUG
      // =================================================

      console.log("========== FORMDATA ==========");

      for (const [key, value] of optimizedFormData.entries()) {
        console.log(key, value);
      }

      setSubmitPhase("saving");

      if (mode === "edit" && product) {
        await updateProduct(product.id, optimizedFormData);
      } else {
        await createProduct(optimizedFormData);
      }
    } catch (error: unknown) {
      // =================================================
      // NEXT.JS REDIRECT
      // =================================================

      if (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof (error as any).digest === "string" &&
        (error as any).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }

      console.log(error);

      // =================================================
      // IMAGE OPTIMIZATION ERROR
      // =================================================

      if (error instanceof ProductImageOptimizeError) {
        alert(optimizeErrorMessage(error.code, t));
        return;
      }

      // =================================================
      // IMAGE UPLOAD ERROR
      // =================================================

      if (
        error instanceof Error &&
        error.message === PRODUCT_IMAGE_UPLOAD_FAILED
      ) {
        alert(t.productImageUploadFailed);
        return;
      }

      // =================================================
      // VALIDATION ERROR
      // =================================================

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      // =================================================
      // UNKNOWN ERROR
      // =================================================

      alert(
        mode === "edit" ? t.productUpdateFailed : t.productCreateFailed,
      );
    } finally {
      submitLockRef.current = false;
      setSubmitPhase("idle");
    }
  }

  const submitLabel =
    submitPhase === "processing"
      ? t.processingImages
      : submitPhase === "saving"
        ? t.uploading
        : mode === "edit"
          ? t.updateProduct
          : t.createProduct;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <BasicInfoSection brands={brands} product={product} />

      <CategoriesSection
        categories={categories}
        productCategories={product?.product_categories}
      />

      <SpecificationsSection product={product} />

      <ImagesSection product={product} />

      <button
        type="submit"
        disabled={submitPhase !== "idle"}
        className="w-full rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 md:w-auto"
      >
        {submitLabel}
      </button>
    </form>
  );
}
