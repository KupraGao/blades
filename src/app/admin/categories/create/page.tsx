import { createCategory } from "@/actions/categories/create-category";

export default function CreateCategoryPage() {

  return (
    <div>

      {/* TOP */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          Create Category
        </h1>

        <p className="mt-2 text-zinc-400">
          Add a new category
        </p>

      </div>

      {/* FORM */}
      <form
        action={createCategory}
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
            placeholder="დანები"
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
            placeholder="Knives"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            required
          />

        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          Save Category
        </button>

      </form>

    </div>
  );

}