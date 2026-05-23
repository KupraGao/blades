export default function ProductsPage() {
  return (
    <div>

      {/* TOP */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Products
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your products
          </p>
        </div>

        <button
          className="
            rounded-xl
            bg-white
            px-5
            py-3
            font-semibold
            text-black
            transition
            hover:bg-zinc-200
          "
        >
          + Add Product
        </button>

      </div>

      {/* TABLE */}
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-900
        "
      >

        {/* HEADER */}
        <div
          className="
            grid
            grid-cols-[80px_1fr_140px_120px_140px]
            border-b
            border-zinc-800
            bg-zinc-950
            px-6
            py-4
            text-sm
            font-semibold
            text-zinc-400
          "
        >
          <div>Image</div>
          <div>Product</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Actions</div>
        </div>

        {/* ROW 1 */}
        <div
          className="
            grid
            grid-cols-[80px_1fr_140px_120px_140px]
            items-center
            border-b
            border-zinc-800
            px-6
            py-4
          "
        >

          <div>
            <div
              className="
                h-14
                w-14
                rounded-lg
                bg-zinc-800
              "
            />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Benchmade Knife
            </h3>

            <p className="text-sm text-zinc-400">
              Folding Knife
            </p>
          </div>

          <div className="font-medium text-white">
            $320
          </div>

          <div>
            <span
              className="
                rounded-full
                bg-green-500/20
                px-3
                py-1
                text-sm
                text-green-400
              "
            >
              In Stock
            </span>
          </div>

          <div className="flex gap-2">

            <button
              className="
                rounded-lg
                bg-zinc-800
                px-4
                py-2
                text-sm
                text-white
                hover:bg-zinc-700
              "
            >
              Edit
            </button>

            <button
              className="
                rounded-lg
                bg-red-500/20
                px-4
                py-2
                text-sm
                text-red-400
                hover:bg-red-500/30
              "
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}