"use client";

import { createProduct } from "@/actions/products/create-product";

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
  name: string;
};

type CreateProductFormProps = {
  brands: Brand[];
  categories: Category[];
};

export default function CreateProductForm({
  brands,
  categories,
}: CreateProductFormProps) {

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    try {

      await createProduct(formData);

      form.reset();

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

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <BasicInfoSection
        brands={brands}
      />

      <CategoriesSection
        categories={categories}
      />

      <SpecificationsSection />

      <ImagesSection />

      <button
        type="submit"
        className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
      >
        პროდუქტის შექმნა
      </button>

    </form>

  );

}