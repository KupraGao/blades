"use client";

import { useLanguage } from "@/context/LanguageContext";

type Category = {
  id: string;
  name_ka: string;
  name_en: string;
};

type ProductCategory = {
  category_id: string;
};

type CategoriesSectionProps = {
  categories: Category[];
  productCategories?: ProductCategory[];
};

export default function CategoriesSection({
  categories,
  productCategories,
}: CategoriesSectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 md:p-6">
      <h2 className="mb-6 text-xl font-bold text-white">{t.categories}</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <label
            key={category.id}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 text-white transition hover:border-white"
          >
            <input
              type="checkbox"
              name="categories"
              value={category.id}
              defaultChecked={productCategories?.some(
                (item) => item.category_id === category.id,
              )}
              className="h-5 w-5"
            />

            {language === "ka" ? category.name_ka : category.name_en}
          </label>
        ))}
      </div>
    </div>
  );
}
