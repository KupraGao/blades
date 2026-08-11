"use client";

import { useLanguage } from "@/context/LanguageContext";

type Category = {
  name_ka: string;
  name_en: string;
};

type Props = {
  mode: "create" | "edit";
  category?: Category;
  action: (formData: FormData) => Promise<void>;
};

export default function CategoryForm({ mode, category, action }: Props) {
  const { t } = useLanguage();

  return (
    <div>
      {/* TOP */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          {mode === "create" ? t.createCategory : t.editCategory}
        </h1>

        <p className="mt-2 text-zinc-400">
          {mode === "create"
            ? t.createCategoryDescription
            : t.editCategoryDescription}
        </p>
      </div>

      {/* FORM */}
      <form
        action={action}
        className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
      >
        {/* GEORGIAN */}
        <div>
          <label
            htmlFor="name_ka"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.georgianName}
          </label>

          <input
            id="name_ka"
            name="name_ka"
            type="text"
            placeholder="დანები"
            defaultValue={category?.name_ka}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            required
          />
        </div>

        {/* ENGLISH */}
        <div>
          <label
            htmlFor="name_en"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.englishName}
          </label>

          <input
            id="name_en"
            name="name_en"
            type="text"
            placeholder="Knives"
            defaultValue={category?.name_en}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            required
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          {mode === "create" ? t.saveCategory : t.updateCategory}
        </button>
      </form>
    </div>
  );
}
