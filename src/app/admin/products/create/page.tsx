"use client";

import { createProduct } from "@/actions/products/create-product";

import BasicInfoSection from "@/components/admin/BasicInfoSection";
import CategoriesSection from "@/components/admin/CategoriesSection";
import SpecificationsSection from "@/components/admin/SpecificationsSection";
import ImagesSection from "@/components/admin/ImagesSection";

/* PAGE */
export default function CreateProductPage() {
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await createProduct(formData);
      /* RESET FORM */
      form.reset();
      /* SUCCESS */
      alert(
        "პროდუქტი წარმატებით დაემატა ✅"
      );
    } catch (error) {
      console.log(error);
      alert(
        "პროდუქტის დამატება ვერ მოხერხდა ❌"
      );
    }
  }
  return (
    <div className="mx-auto max-w-5xl">
      {/* PAGE TOP */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          პროდუქტის დამატება
        </h1>
        <p className="mt-2 text-zinc-400">
          ახალი დანის პროდუქტის შექმნა
        </p>
      </div>
      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* BASIC INFO */}
        <BasicInfoSection />
        {/* CATEGORIES */}
        <CategoriesSection />
        {/* SPECIFICATIONS */}
        <SpecificationsSection />
        {/* PRODUCT IMAGES */}
        <ImagesSection />
        {/* SUBMIT */}
        <button
          type="submit"
          className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
        >
          პროდუქტის შექმნა
        </button>
      </form>
    </div>
  );
}