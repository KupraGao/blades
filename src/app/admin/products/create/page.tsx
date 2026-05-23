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

          <label
            htmlFor="title"
            className="
              mb-2 block text-sm
              font-medium text-zinc-300
            "
          >
            Product Title
          </label>

          <input
            id="title"
            type="text"
            name="title"
            placeholder="Benchmade Knife"
            title="Product Title"
            className="
              w-full rounded-xl
              border border-zinc-800
              bg-zinc-900
              px-4 py-3
              text-white
              outline-none
              transition
              focus:border-white
            "
          />

        </div>

        {/* ================================================= */}
        {/* PRODUCT PRICE */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="price"
            className="
              mb-2 block text-sm
              font-medium text-zinc-300
            "
          >
            Price
          </label>

          <input
            id="price"
            type="number"
            name="price"
            placeholder="320"
            title="Product Price"
            className="
              w-full rounded-xl
              border border-zinc-800
              bg-zinc-900
              px-4 py-3
              text-white
              outline-none
              transition
              focus:border-white
            "
          />

        </div>

        {/* ================================================= */}
        {/* PRODUCT STOCK */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="stock"
            className="
              mb-2 block text-sm
              font-medium text-zinc-300
            "
          >
            Stock
          </label>

          <input
            id="stock"
            type="number"
            name="stock"
            placeholder="15"
            title="Product Stock"
            className="
              w-full rounded-xl
              border border-zinc-800
              bg-zinc-900
              px-4 py-3
              text-white
              outline-none
              transition
              focus:border-white
            "
          />

        </div>

        {/* ================================================= */}
        {/* PRODUCT DESCRIPTION */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="description"
            className="
              mb-2 block text-sm
              font-medium text-zinc-300
            "
          >
            Description
          </label>

          <textarea
            id="description"
            rows={6}
            name="description"
            placeholder="Product description..."
            title="Product Description"
            className="
              w-full rounded-xl
              border border-zinc-800
              bg-zinc-900
              px-4 py-3
              text-white
              outline-none
              transition
              focus:border-white
            "
          />

        </div>

        {/* ================================================= */}
        {/* MAIN IMAGE */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="mainImage"
            className="
              mb-2 block text-sm
              font-medium text-zinc-300
            "
          >
            Main Image
          </label>

          <input
            id="mainImage"
            type="file"
            name="mainImage"
            accept="image/*"
            title="Main Product Image"
            className="
              block w-full rounded-xl
              border border-zinc-800
              bg-zinc-900
              p-3 text-sm text-white
              file:mr-4
              file:rounded-lg
              file:border-0
              file:bg-white
              file:px-4
              file:py-2
              file:text-sm
              file:font-semibold
              file:text-black
              hover:file:bg-zinc-200
            "
          />

        </div>

        {/* ================================================= */}
        {/* GALLERY IMAGES */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="galleryImages"
            className="
              mb-2 block text-sm
              font-medium text-zinc-300
            "
          >
            Gallery Images
          </label>

          <input
            id="galleryImages"
            type="file"
            name="galleryImages"
            multiple
            accept="image/*"
            title="Gallery Product Images"
            className="
              block w-full rounded-xl
              border border-zinc-800
              bg-zinc-900
              p-3 text-sm text-white
              file:mr-4
              file:rounded-lg
              file:border-0
              file:bg-white
              file:px-4
              file:py-2
              file:text-sm
              file:font-semibold
              file:text-black
              hover:file:bg-zinc-200
            "
          />

        </div>

        {/* ================================================= */}
        {/* SUBMIT BUTTON */}
        {/* ================================================= */}

        <button
          type="submit"
          className="
            rounded-xl bg-white
            px-6 py-3
            font-semibold text-black
            transition hover:bg-zinc-200
          "
        >
          Create Product
        </button>

      </form>

    </div>

  );

}