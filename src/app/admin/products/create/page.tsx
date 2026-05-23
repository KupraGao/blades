"use client";

import { createProduct } from "@/actions/products/create-product";

export default function CreateProductPage() {

  // =================================================
  // FORM SUBMIT
  // =================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    // page refresh stop

    event.preventDefault();

    // form data

    const formData = new FormData(
      event.currentTarget
    );

    // create product

    await createProduct(formData);

  }

  return (

    <div className="mx-auto max-w-3xl">

      {/* ================================================= */}
      {/* PAGE TOP */}
      {/* ================================================= */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-white">
          Add Product
        </h1>

        <p className="mt-2 text-zinc-400">
          Create a new product
        </p>

      </div>


      {/* ================================================= */}
      {/* PRODUCT FORM */}
      {/* ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >


        {/* ================================================= */}
        {/* PRODUCT TITLE */}
        {/* ================================================= */}

        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Product Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Benchmade Knife"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>


        {/* ================================================= */}
        {/* PRODUCT PRICE */}
        {/* ================================================= */}

        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Price
          </label>

          <input
            type="number"
            name="price"
            placeholder="320"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>


        {/* ================================================= */}
        {/* PRODUCT STOCK */}
        {/* ================================================= */}

        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Stock
          </label>

          <input
            type="number"
            name="stock"
            placeholder="15"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>


        {/* ================================================= */}
        {/* PRODUCT DESCRIPTION */}
        {/* ================================================= */}

        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Description
          </label>

          <textarea
            rows={6}
            name="description"
            placeholder="Product description..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>


        {/* ================================================= */}
        {/* MAIN IMAGE */}
        {/* ================================================= */}

        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Main Image
          </label>

          <input
            type="file"
            name="mainImage"
            accept="image/*"
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-zinc-200"
          />

        </div>


        {/* ================================================= */}
        {/* GALLERY IMAGES */}
        {/* ================================================= */}

        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Gallery Images
          </label>

          <input
            type="file"
            name="galleryImages"
            multiple
            accept="image/*"
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-zinc-200"
          />

        </div>


        {/* ================================================= */}
        {/* SUBMIT BUTTON */}
        {/* ================================================= */}

        <button
          type="submit"
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          Create Product
        </button>

      </form>

    </div>

  );

}