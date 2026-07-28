import { createBrand } from "@/actions/brands/create-brand";

export default function CreateBrandPage() {
  return (
    <div>

      {/* TOP */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          Create Brand
        </h1>

        <p className="mt-2 text-zinc-400">
          Add a new brand
        </p>
      </div>

      {/* FORM */}
      <form
        action={createBrand}
        className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
      >

        {/* NAME */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Brand Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Benchmade"
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
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="benchmade"
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
            Logo URL
          </label>

          <input
            id="logo"
            name="logo"
            type="text"
            placeholder="https://..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          Save Brand
        </button>

      </form>

    </div>
  );
}