"use client";

import { createProduct } from "@/actions/products/create-product";

export default function CreateProductPage() {

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    await createProduct(formData);

  }

  return (

    <div className="mx-auto max-w-5xl">

      {/* ====================================== */}
      {/* PAGE TOP */}
      {/* ====================================== */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          Add Product
        </h1>

        <p className="mt-2 text-zinc-400">
          Create a new knife product
        </p>

      </div>

      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* ====================================== */}
        {/* BASIC INFO */}
        {/* ====================================== */}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            Basic Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* TITLE */}

            <div>

              <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-300">
                Product Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                placeholder="Spyderco Paramilitary 2"
                title="Product Title"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* BRAND */}

            <div>

              <label htmlFor="brandId" className="mb-2 block text-sm font-medium text-zinc-300">
                Brand
              </label>

              <select
                id="brandId"
                name="brandId"
                title="Select Brand"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              >

                <option value="">
                  Select Brand
                </option>

                <option value="1">Olamic</option>
                <option value="2">Kansept Knives</option>
                <option value="3">Maxace</option>
                <option value="4">Spyderco</option>
                <option value="5">Cold Steel</option>
                <option value="6">Cheburkov</option>
                <option value="7">Microtech</option>
                <option value="8">Tuotown</option>
                <option value="9">Freetiger</option>

              </select>

            </div>

            {/* PRICE */}

            <div>

              <label htmlFor="price" className="mb-2 block text-sm font-medium text-zinc-300">
                Price
              </label>

              <input
                id="price"
                type="number"
                name="price"
                placeholder="320"
                title="Product Price"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* STOCK */}

            <div>

              <label htmlFor="stock" className="mb-2 block text-sm font-medium text-zinc-300">
                Stock
              </label>

              <input
                id="stock"
                type="number"
                name="stock"
                placeholder="15"
                title="Product Stock"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

          </div>

        </div>

        {/* ====================================== */}
        {/* CATEGORIES */}
        {/* ====================================== */}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            Categories
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {[
              ["1", "ყველა დანა"],
              ["2", "დასაკეცი"],
              ["3", "ფიქსირებული"],
              ["4", "ექსკლუზიური / ლიმიტირებული"],
              ["5", "მაჩეტე / ნაჯახი"],
              ["6", "სამზარეულო"],
              ["7", "ტყავის აქსესუარები"],
              ["8", "ხელნაკეთი საფულეები"],
              ["9", "სანადირო აქსესუარები"],
              ["10", "ფანრები"],
              ["11", "სასაჩუქრე ნაკრებები"],
              ["12", "ფასდაკლება"],
              ["13", "აქსესუარები"],
            ].map(([id, name]) => (

              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 text-white transition hover:border-white"
              >

                <input
                  type="checkbox"
                  name="categories"
                  value={id}
                  className="h-5 w-5"
                />

                {name}

              </label>

            ))}

          </div>

        </div>

        {/* ====================================== */}
        {/* SPECIFICATIONS */}
        {/* ====================================== */}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            Specifications
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label htmlFor="overallLength" className="mb-2 block text-sm font-medium text-zinc-300">
                Overall Length
              </label>

              <input
                id="overallLength"
                type="text"
                name="overallLength"
                placeholder="21.8 cm"
                title="Overall Length"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="bladeLength" className="mb-2 block text-sm font-medium text-zinc-300">
                Blade Length
              </label>

              <input
                id="bladeLength"
                type="text"
                name="bladeLength"
                placeholder="9.4 cm"
                title="Blade Length"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="bladeThickness" className="mb-2 block text-sm font-medium text-zinc-300">
                Blade Thickness
              </label>

              <input
                id="bladeThickness"
                type="text"
                name="bladeThickness"
                placeholder="3.7 mm"
                title="Blade Thickness"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="bladeSteel" className="mb-2 block text-sm font-medium text-zinc-300">
                Blade Steel
              </label>

              <input
                id="bladeSteel"
                type="text"
                name="bladeSteel"
                placeholder="CPM S30V"
                title="Blade Steel"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="handleMaterial" className="mb-2 block text-sm font-medium text-zinc-300">
                Handle Material
              </label>

              <input
                id="handleMaterial"
                type="text"
                name="handleMaterial"
                placeholder="G10"
                title="Handle Material"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="lockingType" className="mb-2 block text-sm font-medium text-zinc-300">
                Locking Type
              </label>

              <input
                id="lockingType"
                type="text"
                name="lockingType"
                placeholder="Compression Lock"
                title="Locking Type"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="bladeFinish" className="mb-2 block text-sm font-medium text-zinc-300">
                Blade Finish
              </label>

              <input
                id="bladeFinish"
                type="text"
                name="bladeFinish"
                placeholder="Stonewash"
                title="Blade Finish"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="knifeType" className="mb-2 block text-sm font-medium text-zinc-300">
                Knife Type
              </label>

              <input
                id="knifeType"
                type="text"
                name="knifeType"
                placeholder="Folding Knife"
                title="Knife Type"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="country" className="mb-2 block text-sm font-medium text-zinc-300">
                Country
              </label>

              <input
                id="country"
                type="text"
                name="country"
                placeholder="USA"
                title="Country"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            <div>

              <label htmlFor="weight" className="mb-2 block text-sm font-medium text-zinc-300">
                Weight
              </label>

              <input
                id="weight"
                type="text"
                name="weight"
                placeholder="110 g"
                title="Weight"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

          </div>

        </div>

        {/* ====================================== */}
        {/* IMAGES */}
        {/* ====================================== */}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            Product Images
          </h2>

          <div className="space-y-6">

            <div>

              <label htmlFor="mainImage" className="mb-2 block text-sm font-medium text-zinc-300">
                Main Image
              </label>

              <input
                id="mainImage"
                type="file"
                name="mainImage"
                accept="image/*"
                title="Main Product Image"
                className="block w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-sm text-white"
              />

            </div>

            <div>

              <label htmlFor="galleryImages" className="mb-2 block text-sm font-medium text-zinc-300">
                Gallery Images
              </label>

              <input
                id="galleryImages"
                type="file"
                name="galleryImages"
                multiple
                accept="image/*"
                title="Gallery Product Images"
                className="block w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-sm text-white"
              />

            </div>

          </div>

        </div>

        {/* ====================================== */}
        {/* SUBMIT */}
        {/* ====================================== */}

        <button
          type="submit"
          className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
        >
          Create Product
        </button>

      </form>

    </div>

  );

}