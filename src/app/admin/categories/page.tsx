import Link from "next/link";
import { getCategories } from "@/actions/categories/get-categories";
import DeleteCategoryButton from "@/app/admin/categories/DeleteCategoryButton";

type Category={
  id:string;
  name_ka:string;
  name_en:string;
};

export default async function CategoriesPage(){

  const categories:Category[]=await getCategories();

  return(

    <div>

      {/* TOP */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Categories
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your categories
          </p>

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

        <div className="grid grid-cols-[1.3fr_1fr_180px] gap-6 border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">

          <div>Georgian</div>

          <div>English</div>

          <div className="text-right">
            Actions
          </div>

        </div>

        {/* BODY */}

        {categories.length===0?(

          <div className="py-20 text-center text-zinc-500">
            No categories found.
          </div>

        ):(

          categories.map((category)=>(

            <div
              key={category.id}
              className="grid grid-cols-[1.3fr_1fr_180px] gap-6 items-center border-b border-zinc-800 px-4 py-4 transition hover:bg-zinc-800/40 last:border-b-0"
            >

              {/* Georgian */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">

                <div className="text-lg font-semibold text-white">
                  {category.name_ka}
                </div>

              </div>

              {/* English */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">

                <div className="text-zinc-300">
                  {category.name_en}
                </div>

              </div>

              {/* Actions */}

              <div className="flex justify-end gap-2">

                <Link
                  href={`/admin/categories/edit/${category.id}`}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white transition hover:bg-zinc-700"
                >
                  Edit
                </Link>

                <DeleteCategoryButton categoryId={category.id}/>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

}