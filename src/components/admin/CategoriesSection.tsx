type Category = {
  id: string;
  name: string;
};

type CategoriesSectionProps = {
  categories: Category[];
};

export default function CategoriesSection({
  categories,
}: CategoriesSectionProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">
        კატეგორიები
      </h2>

      <div className="grid gap-4 md:grid-cols-3">

        {categories.map((category) => (

          <label
            key={category.id}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 text-white transition hover:border-white"
          >

            <input
              type="checkbox"
              name="categories"
              value={category.id}
              className="h-5 w-5"
            />

            {category.name}

          </label>

        ))}

      </div>

    </div>
  );
}