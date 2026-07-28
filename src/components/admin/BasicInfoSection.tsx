export default function BasicInfoSection() {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">
        ძირითადი ინფორმაცია
      </h2>

      <div className="grid gap-5 md:grid-cols-2">

        {/* TITLE */}
        <div>

          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            პროდუქტის დასახელება
          </label>

          <input
            id="title"
            type="text"
            name="title"
            placeholder="Spyderco Paramilitary 2"
            title="პროდუქტის დასახელება"
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>

        {/* BRAND */}
        <div>

          <label
            htmlFor="brandId"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            ბრენდი
          </label>

          <select
            id="brandId"
            name="brandId"
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

          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            ფასი
          </label>

          <input
            id="price"
            type="number"
            name="price"
            placeholder="320"
            title="ფასი"
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>

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

        {/* STOCK */}
        <div>

          <label
            htmlFor="stock"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            მარაგი
          </label>

          <input
            id="stock"
            type="number"
            name="stock"
            placeholder="15"
            title="მარაგი"
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />

        </div>

      </div>

    </div>
  );
}