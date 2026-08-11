"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateProductCategoriesBulk } from "@/actions/products/update-product-categories-bulk";
import { useLanguage } from "@/context/LanguageContext";

type Category = {
  id: string;
  name_ka: string;
  name_en: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedProducts: string[];
  onSuccess: () => void;
};

export default function ChangeCategoriesModal({
  open,
  onClose,
  categories,
  selectedProducts,
  onSuccess,
}: Props) {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return null;
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }

  async function saveChanges() {
    if (selectedProducts.length === 0 || selectedCategories.length === 0) {
      return;
    }

    try {
      setLoading(true);

      await updateProductCategoriesBulk({
        productIds: selectedProducts,
        categoryIds: selectedCategories,
      });

      router.refresh();

      setSelectedCategories([]);

      // მონიშნული პროდუქტების გასუფთავება
      onSuccess();

      onClose();

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          {t.changeCategories}
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          {t.changeCategoriesDescription}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map((category) => (

            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition hover:bg-zinc-800"
            >

              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-800"
              />

              <span className="truncate text-white">
                {language === "ka" ? category.name_ka : category.name_en}
              </span>

            </label>

          ))}

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-white transition hover:bg-zinc-800"
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={saveChanges}
            disabled={loading || selectedCategories.length === 0}
            className="rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t.saving : t.saveChanges}
          </button>

        </div>

      </div>
    </div>
  );
}
