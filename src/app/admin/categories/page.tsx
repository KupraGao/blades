import Link from "next/link";
import { getCategories } from "@/actions/categories/get-categories";
import DeleteCategoryButton from "@/app/admin/categories/DeleteCategoryButton";

type Category = {
  id: string;
  name_ka: string;
  name_en: string;
};

export default async function CategoriesPage() {
  const categories: Category[] = await getCategories();

  return (
    <div>
      {/* TOP */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Categories</h1>
          <p className="mt-2 text-zinc-400">Manage your categories</p>
        </div>

        <Link
          href="/admin/categories/create"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Add Category
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {/* HEADER */}
        <div className="grid grid-cols-[120px_1fr_1fr_140px] border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400">
          <div>ID</div>
          <div>Georgian</div>
          <div>English</div>
          <div>Actions</div>
        </div>

        {/* BODY */}
        {categories.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            No categories found.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-[120px_1fr_1fr_140px] items-center border-b border-zinc-800 px-6 py-4"
            >
              <div className="text-zinc-400">{category.id}</div>

              <div className="font-semibold text-white">
                {category.name_ka}
              </div>

              <div className="text-zinc-400">{category.name_en}</div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/categories/edit/${category.id}`}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white transition hover:bg-zinc-700"
                >
                  Edit
                </Link>

                <DeleteCategoryButton categoryId={category.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}