"use client";

import { createProduct } from "@/actions/products/create-product";
import { updateProduct } from "@/actions/products/update-product";

import BasicInfoSection from "@/components/admin/BasicInfoSection";
import CategoriesSection from "@/components/admin/CategoriesSection";
import SpecificationsSection from "@/components/admin/SpecificationsSection";
import ImagesSection from "@/components/admin/ImagesSection";

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

export default function ProductForm({
  brands,
  categories,
  mode = "create",
  product,
}: ProductFormProps) {

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    // =================================================
    // FORMDATA DEBUG
    // =================================================

    console.log("========== FORMDATA ==========");

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {

      if (mode === "edit" && product) {

        await updateProduct(
          product.id,
          formData
        );

      } else {

        await createProduct(formData);

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
        mode === "edit"
          ? "პროდუქტის განახლება ვერ მოხერხდა ❌"
          : "პროდუქტის დამატება ვერ მოხერხდა ❌"
      );

    }

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <BasicInfoSection
        brands={brands}
        product={product}
      />

      <CategoriesSection
        categories={categories}
        productCategories={product?.product_categories}
      />

      <SpecificationsSection
        product={product}
      />

      <ImagesSection
        product={product}
      />

      <button
        type="submit"
        className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
      >
        {mode === "edit"
          ? "პროდუქტის განახლება"
          : "პროდუქტის შექმნა"}
      </button>

    </form>

  );

}