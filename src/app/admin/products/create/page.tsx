"use client";

import { createProduct } from "@/actions/products/create-product";

/* ====================================== */
/* BLADE STEELS */
/* ====================================== */

const bladeSteels = [ "1055 Carbon Steel", "1075 High Carbon", "1095 Carbon Steel", "10Cr15CoMov", "12C28N", "14C28N", "154CM", "420HC", "440C", "52100", "8Cr13MoV", "9Cr18MoV", "AUS-8", "AUS-10", "CPM 3V", "CPM S30V", "CPM S35VN", "CPM S45VN", "CPM S90V", "CPM S110V", "CTS-XHP", "D2", "Damascus", "Elmax", "K390", "LC200N", "M390", "MagnaCut", "N690", "Nitro-V", "VG-10", "Vanax", "ZDP-189",
];

/* ====================================== */
/* LOCKING TYPES */
/* ====================================== */

const lockingTypes = [ "Back Lock", "Ball Bearing Lock", "Bar Lock", "Bolster Lock", "Button Lock", "Button / Compression Lock", "Button / Frame Lock", "Click Lock", "Clutch Lock", "Compression Lock", "Crossbar Lock", "Double Detent", "Frame Lock", "Friction Lock", "ILS (Ikoma Locking System)", "Latch Lock", "Leverage Lock", "Liner Lock", "OTF Automatic", "Pivot Lock", "Push Button", "Rail Lock", "Ram Lock", "Ring Lock", "Rockback Lock", "Rotoblock Safety System", "Shark Lock", "Slide Lock", "Slip Joint", "Super Lock", "Tactical Operation Lock", "Top Liner Lock", "Track Lock", "Tri-Ad Lock",
];

/* ====================================== */
/* PAGE */
/* ====================================== */

export default function CreateProductPage() {

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {

  event.preventDefault();

  const form =
    event.currentTarget;

  const formData =
    new FormData(form);

  try {

    await createProduct(formData);

    /* ====================================== */
    /* RESET FORM */
    /* ====================================== */

    form.reset();

    /* ====================================== */
    /* SUCCESS */
    /* ====================================== */

    alert(
      "პროდუქტი წარმატებით დაემატა ✅"
    );

  } catch (error) {

    console.log(error);

    alert(
      "პროდუქტის დამატება ვერ მოხერხდა ❌"
    );

  }

}

  return (

    <div className="mx-auto max-w-5xl">

      {/* ====================================== */}
      {/* PAGE TOP */}
      {/* ====================================== */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          პროდუქტის დამატება
        </h1>

        <p className="mt-2 text-zinc-400">
          ახალი დანის პროდუქტის შექმნა
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
            ძირითადი ინფორმაცია
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* ====================================== */}
            {/* TITLE */}
            {/* ====================================== */}

            <div>

              <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-300">
                პროდუქტის დასახელება
              </label>

              <input
                id="title" type="text" name="title"
                placeholder="Spyderco Paramilitary 2"
                title="პროდუქტის დასახელება"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* BRAND */}
            {/* ====================================== */}

            <div>

              <label htmlFor="brandId" className="mb-2 block text-sm font-medium text-zinc-300">
                ბრენდი
              </label>

              <select
                id="brandId" name="brandId"
                title="ბრენდის არჩევა"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              >

                <option value="">
                  აირჩიე ბრენდი
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

            {/* ====================================== */}
            {/* PRICE */}
            {/* ====================================== */}

            <div>

              <label htmlFor="price" className="mb-2 block text-sm font-medium text-zinc-300">
                ფასი
              </label>

              <input
                id="price" type="number" name="price"
                placeholder="320"
                title="ფასი"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* STOCK */}
            {/* ====================================== */}

            <div>

              <label htmlFor="stock" className="mb-2 block text-sm font-medium text-zinc-300">
                მარაგი
              </label>

              <input
                id="stock" type="number" name="stock"
                placeholder="15"
                title="მარაგი"
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
            კატეგორიები
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {[ ["1", "ყველა დანა"], ["2", "დასაკეცი"], ["3", "ფიქსირებული"], ["4", "ექსკლუზიური / ლიმიტირებული"], ["5", "მაჩეტე / ნაჯახი"], ["6", "სამზარეულო"], ["7", "ტყავის აქსესუარები"], ["8", "ხელნაკეთი საფულეები"], ["9", "სანადირო აქსესუარები"], ["10", "ფანრები"], ["11", "სასაჩუქრე ნაკრებები"], ["12", "ფასდაკლება"], ["13", "აქსესუარები"],
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
            მახასიათებლები
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* ====================================== */}
            {/* OVERALL LENGTH */}
            {/* ====================================== */}

            <div>

              <label htmlFor="overallLength" className="mb-2 block text-sm font-medium text-zinc-300">
                მთლიანი სიგრძე
              </label>

              <input
                id="overallLength" type="text" name="overallLength"
                placeholder="21.8 cm"
                title="მთლიანი სიგრძე"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* BLADE LENGTH */}
            {/* ====================================== */}

            <div>

              <label htmlFor="bladeLength" className="mb-2 block text-sm font-medium text-zinc-300">
                პირის სიგრძე
              </label>

              <input
                id="bladeLength" type="text" name="bladeLength"
                placeholder="9.4 cm"
                title="პირის სიგრძე"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* BLADE THICKNESS */}
            {/* ====================================== */}

            <div>

              <label htmlFor="bladeThickness" className="mb-2 block text-sm font-medium text-zinc-300">
                პირის სისქე
              </label>

              <input
                id="bladeThickness" type="text" name="bladeThickness"
                placeholder="3.7 mm"
                title="პირის სისქე"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* BLADE STEEL */}
            {/* ====================================== */}

            <div>

              <label htmlFor="bladeSteel" className="mb-2 block text-sm font-medium text-zinc-300">
                ფოლადის ტიპი
              </label>

              <select
                id="bladeSteel" name="bladeSteel"
                title="ფოლადის ტიპი"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              >

                <option value="">
                  აირჩიე ფოლადის ტიპი
                </option>

                {bladeSteels.map((steel) => (

                  <option
                    key={steel}
                    value={steel}
                  >
                    {steel}
                  </option>

                ))}

              </select>

            </div>

            {/* ====================================== */}
            {/* HANDLE MATERIAL */}
            {/* ====================================== */}

            <div>

              <label htmlFor="handleMaterial" className="mb-2 block text-sm font-medium text-zinc-300">
                ტარის მასალა
              </label>

              <input
                id="handleMaterial" type="text" name="handleMaterial"
                placeholder="G10"
                title="ტარის მასალა"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* LOCKING TYPE */}
            {/* ====================================== */}

            <div>

              <label htmlFor="lockingType" className="mb-2 block text-sm font-medium text-zinc-300">
                ჩაკეტვის მექანიზმი
              </label>

              <select
                id="lockingType" name="lockingType"
                title="ჩაკეტვის მექანიზმი"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              >

                <option value="">
                  აირჩიე ჩაკეტვის მექანიზმი
                </option>

                {lockingTypes.map((type) => (

                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>

                ))}

              </select>

            </div>

            {/* ====================================== */}
            {/* BLADE FINISH */}
            {/* ====================================== */}

            <div>

              <label htmlFor="bladeFinish" className="mb-2 block text-sm font-medium text-zinc-300">
                პირის ზედაპირი
              </label>

              <input
                id="bladeFinish" type="text" name="bladeFinish"
                placeholder="Stonewash"
                title="პირის ზედაპირი"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* KNIFE TYPE */}
            {/* ====================================== */}

            <div>

              <label htmlFor="knifeType" className="mb-2 block text-sm font-medium text-zinc-300">
                დანის ტიპი
              </label>

              <input
                id="knifeType" type="text" name="knifeType"
                placeholder="Folding Knife"
                title="დანის ტიპი"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* COUNTRY */}
            {/* ====================================== */}

            <div>

              <label htmlFor="country" className="mb-2 block text-sm font-medium text-zinc-300">
                ქვეყანა
              </label>

              <input
                id="country" type="text" name="country"
                placeholder="USA"
                title="ქვეყანა"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

            {/* ====================================== */}
            {/* WEIGHT */}
            {/* ====================================== */}

            <div>

              <label htmlFor="weight" className="mb-2 block text-sm font-medium text-zinc-300">
                წონა
              </label>

              <input
                id="weight" type="text" name="weight"
                placeholder="110 g"
                title="წონა"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
              />

            </div>

          </div>

        </div>
{/* ====================================== */}
{/* PRODUCT IMAGES */}
{/* ====================================== */}

<div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

  <h2 className="mb-6 text-xl font-bold text-white">
    პროდუქტის ფოტოები
  </h2>

  <div className="grid gap-5 md:grid-cols-2">

    {/* ====================================== */}
    {/* MAIN IMAGE */}
    {/* ====================================== */}

    <div>

      <label
        htmlFor="mainImage"
        className="mb-2 block text-sm font-medium text-zinc-300"
      >
        მთავარი ფოტო
      </label>

      <input
        id="mainImage"
        type="file"
        name="mainImage"
        accept="image/*"
        title="მთავარი ფოტო"
        className="w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-white"
      />

    </div>

    {/* ====================================== */}
    {/* GALLERY IMAGES */}
    {/* ====================================== */}

    <div>

      <label
        htmlFor="galleryImages"
        className="mb-2 block text-sm font-medium text-zinc-300"
      >
        გალერიის ფოტოები
      </label>

      <input
        id="galleryImages"
        type="file"
        name="galleryImages"
        multiple
        accept="image/*"
        title="გალერიის ფოტოები"
        className="w-full rounded-xl border border-zinc-800 bg-black/40 p-3 text-white"
      />

    </div>

  </div>

</div>
        {/* ====================================== */}
        {/* SUBMIT */}
        {/* ====================================== */}

        <button
          type="submit"
          className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
        >
          პროდუქტის შექმნა
        </button>

      </form>

    </div>

  );

}