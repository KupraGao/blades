"use client";

import { useLanguage } from "@/context/LanguageContext";

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

export default function BrandForm({ mode, brand, action }: Props) {
  const { t } = useLanguage();

  return (
    <div>
      {/* TOP */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          {mode === "create" ? t.createBrand : t.editBrand}
        </h1>

        <p className="mt-2 text-zinc-400">
          {mode === "create"
            ? t.createBrandDescription
            : t.editBrandDescription}
        </p>
      </div>

      {/* FORM */}
      <form
        action={action}
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
            {t.logoUrl}
          </label>

          <input
            id="logo"
            name="logo"
            type="text"
            placeholder="https://..."
            defaultValue={brand?.logo ?? ""}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          {mode === "create" ? t.saveBrand : t.updateBrand}
        </button>
      </form>
    </div>
  );
}
