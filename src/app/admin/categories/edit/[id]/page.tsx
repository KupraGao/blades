import { getSingleCategory } from "@/actions/categories/get-single-category";
import { updateCategory } from "@/actions/categories/update-category";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: Props) {

  const { id } = await params;

const category = await getSingleCategory(id);
  if (!category) {
    return (
      <h1 className="text-2xl font-bold text-white">
        Category not found
      </h1>
    );
  }

  async function update(formData: FormData) {
    "use server";
await updateCategory(id, formData);  }

  return (
    <div>

      {/* TOP */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          Edit Category
        </h1>

        <p className="mt-2 text-zinc-400">
          Update category information
        </p>

      </div>

      {/* FORM */}
      <form
        action={update}
        className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
      >

        {/* GEORGIAN */}
        <div>

          <label
            htmlFor="name_ka"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Georgian Name
          </label>

          <input
            id="name_ka"
            name="name_ka"
            type="text"
            defaultValue={category.name_ka}
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
            English Name
          </label>

          <input
            id="name_en"
            name="name_en"
            type="text"
            defaultValue={category.name_en}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            required
          />

        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          Update Category
        </button>

      </form>

    </div>
  );

}