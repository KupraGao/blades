"use client";

import { createProduct } from "@/actions/products/create-product";

/* BLADE STEELS */
const bladeSteels = [ "1055 Carbon Steel", "1075 High Carbon", "1095 Carbon Steel", "10Cr15CoMov", "12C28N", "14C28N", "154CM", "420HC", "440C", "52100", "8Cr13MoV", "9Cr18MoV", "AUS-8", "AUS-10", "CPM 3V", "CPM S30V", "CPM S35VN", "CPM S45VN", "CPM S90V", "CPM S110V", "CTS-XHP", "D2", "Damascus", "Elmax", "K390", "LC200N", "M390", "MagnaCut", "N690", "Nitro-V", "VG-10", "Vanax", "ZDP-189",
];

/* LOCKING TYPES */
const lockingTypes = [ "Back Lock", "Ball Bearing Lock", "Bar Lock", "Bolster Lock", "Button Lock", "Button / Compression Lock", "Button / Frame Lock", "Click Lock", "Clutch Lock", "Compression Lock", "Crossbar Lock", "Double Detent", "Frame Lock", "Friction Lock", "ILS (Ikoma Locking System)", "Latch Lock", "Leverage Lock", "Liner Lock", "OTF Automatic", "Pivot Lock", "Push Button", "Rail Lock", "Ram Lock", "Ring Lock", "Rockback Lock", "Rotoblock Safety System", "Shark Lock", "Slide Lock", "Slip Joint", "Super Lock", "Tactical Operation Lock", "Top Liner Lock", "Track Lock", "Tri-Ad Lock",
];

/* PAGE */
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

    /* RESET FORM */
    form.reset();

    /* SUCCESS */
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

      {/* PAGE TOP */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          პროდუქტის დამატება
        </h1>

        <p className="mt-2 text-zinc-400">
          ახალი დანის პროდუქტის შექმნა
        </p>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* BASIC INFO */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            ძირითადი ინფორმაცია
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* TITLE */}
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

            {/* BRAND */}
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

            {/* PRICE */}
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

            {/* STOCK */}
            {/* REVIEW LINK */}
<div>

  <label
    htmlFor="reviewLink"
    className="mb-2 block text-sm font-medium text-zinc-300"
  >
    განხილვის ლინკი
  </label>

  <input
    id="reviewLink"
    type="text"
    name="reviewLink"
    placeholder="https://youtube.com/watch?v=..."
    title="განხილვის ლინკი"
    className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
  />

</div>
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

        {/* CATEGORIES */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            კატეგორიები
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {[
              //  ["1", "ყველა დანა"],
               ["132de5b2-ff9e-4078-b0cf-ec8afcdd52a7", "დასაკეცი"],
               ["e87dca04-385e-45c0-a0d2-e1587d0567dd", "ფიქსირებული"],
               ["6c32a53c-13eb-4dfc-835c-91561cd030f9", "ექსკლუზიური / ლიმიტირებული"],
               ["990f2785-5878-4a67-837a-b8fac9f69b9c", "მაჩეტე / ნაჯახი"],
               ["ea8a437b-dbbf-45dc-bff8-32708660e869", "სამზარეულო"],
               ["e4c3b7e0-10f2-4572-96de-848859f0aa1e", "ტყავის აქსესუარები"],
               ["956c15f8-81fe-4bf6-a6e9-803a6c60d049", "ხელნაკეთი საფულეები"],
               ["4218f73e-4fbb-4217-b529-76c7b8fce6e7", "სანადირო აქსესუარები"],
               ["6a5679e0-87ae-4126-b8bb-10cf061ba81a", "ფანრები"],
               ["4d665a3e-2c87-41a9-928a-9d545547b12e", "სასაჩუქრე ნაკრებები"],
               ["1c729aeb-2a5a-4ebb-8aef-efede126c324", "ფასდაკლება"],
               ["b3d2e98e-aabd-4b0e-bb85-13a00b53c350", "აქსესუარები"],
              
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

        {/* SPECIFICATIONS */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <h2 className="mb-6 text-xl font-bold text-white">
            მახასიათებლები
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* OVERALL LENGTH */}
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

            {/* BLADE LENGTH */}
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

            {/* BLADE THICKNESS */}
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

            {/* BLADE STEEL */}
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

            {/* HANDLE MATERIAL */}
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

            {/* LOCKING TYPE */}
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

            {/* KNIFE TYPE */}
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

            {/* WEIGHT */}
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
{/* PRODUCT IMAGES */}
<div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

  <h2 className="mb-6 text-xl font-bold text-white">
    პროდუქტის ფოტოები
  </h2>

  <div className="grid gap-5 md:grid-cols-2">

    {/* MAIN IMAGE */}
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

    {/* GALLERY IMAGES */}
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
        {/* SUBMIT */}
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