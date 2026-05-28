import ProductGallery from "@/components/ProductGallery";

import { getSingleProduct } from "@/actions/products/get-single-product";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const { id } = await params;

  const product =
    await getSingleProduct(id);

  if (!product) {

    return (

      <main className="min-h-screen p-10">

        <h1 className="text-3xl font-bold">
          პროდუქტი ვერ მოიძებნა
        </h1>

      </main>

    );

  }

  return (

    <main className="min-h-screen p-6 md:p-10">

      <div
        className="
          mx-auto
          grid
          max-w-7xl
          gap-10
          md:grid-cols-2
        "
      >

        {/* ===================================== */}
        {/* PRODUCT GALLERY + REVIEW VIDEO */}
        {/* ===================================== */}

        <div>

          <ProductGallery
            title={product.title}
            images={product.product_images || []}
          />

          {/* ===================================== */}
          {/* REVIEW VIDEO */}
          {/* ===================================== */}

          {product.review_link && (

            <div className="mt-8">

              <h2
                className="
                  mb-4
                  text-2xl
                  font-bold
                "
              >
                ვიდეო განხილვა
              </h2>

              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-zinc-800
                "
              >

                <iframe
                  width="100%"
                  height="450"
                  src={
                    product.review_link
                      .replace(
                        "watch?v=",
                        "embed/"
                      )
                      .replace(
                        "youtu.be/",
                        "youtube.com/embed/"
                      )
                  }
                  title="Product Review"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full"
                />

              </div>

            </div>

          )}

        </div>

        {/* ===================================== */}
        {/* PRODUCT INFO */}
        {/* ===================================== */}

        <div>

          {/* ===================================== */}
          {/* TITLE */}
          {/* ===================================== */}

          <h1
            className="
              text-3xl
              font-bold
              leading-tight
              md:text-5xl
            "
          >
            {product.title}
          </h1>

          {/* ===================================== */}
          {/* PRICE */}
          {/* ===================================== */}

          <p
            className="
              mt-6
              text-3xl
              font-semibold
            "
          >
            ₾ {product.price}
          </p>

          {/* ===================================== */}
          {/* STOCK STATUS */}
          {/* ===================================== */}

          <div className="mt-4">

            {product.stock > 0 ? (

              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-green-500/10
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-green-500
                "
              >
                მარაგშია • {product.stock} ცალი
              </div>

            ) : (

              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-red-500/10
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-red-500
                "
              >
                არ არის მარაგში
              </div>

            )}

          </div>

          {/* ===================================== */}
          {/* BUY SECTION */}
          {/* ===================================== */}

          <div
            className="
              mt-8
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900/40
              p-6
            "
          >

            {/* QUANTITY */}

            <div className="flex items-center gap-4">

              <span className="text-sm font-medium">
                რაოდენობა
              </span>

              <div
                className="
                  flex
                  items-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-700
                "
              >

                <button
                  type="button"
                  className="
                    px-4
                    py-2
                    transition
                    hover:bg-white/10
                  "
                >
                  -
                </button>

                <span className="px-5">
                  1
                </span>

                <button
                  type="button"
                  className="
                    px-4
                    py-2
                    transition
                    hover:bg-white/10
                  "
                >
                  +
                </button>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-6 flex gap-4">

              <button
                type="button"
                className="
                  flex-1
                  rounded-2xl
                  bg-white
                  px-6
                  py-4
                  font-bold
                  text-black
                  transition
                  hover:scale-[1.02]
                "
              >
                კალათაში დამატება
              </button>

              <button
                type="button"
                className="
                  rounded-2xl
                  border
                  border-zinc-700
                  px-6
                  py-4
                  transition
                  hover:bg-white/10
                "
              >
                ♡
              </button>

            </div>

          </div>

          {/* ===================================== */}
          {/* DESCRIPTION */}
          {/* ===================================== */}

          <p
            className="
              mt-6
              leading-7
              text-gray-600
            "
          >
            {product.description}
          </p>

          {/* ===================================== */}
          {/* SPECIFICATIONS */}
          {/* ===================================== */}

          <div className="mt-10 space-y-4">

            <h2 className="text-2xl font-bold">
              Specifications
            </h2>

            <div className="grid gap-4">

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Blade Steel
                </span>

                <span>
                  {product.blade_steel || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Blade Thickness
                </span>

                <span>
                  {product.blade_thickness || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Blade Length
                </span>

                <span>
                  {product.blade_length || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Handle Material
                </span>

                <span>
                  {product.handle_material || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Locking Type
                </span>

                <span>
                  {product.locking_type || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Knife Type
                </span>

                <span>
                  {product.knife_type || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Blade Finish
                </span>

                <span>
                  {product.blade_finish || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Country
                </span>

                <span>
                  {product.country || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Weight
                </span>

                <span>
                  {product.weight || "-"}
                </span>

              </div>

              <div className="flex justify-between border-b pb-2">

                <span className="font-medium">
                  Overall Length
                </span>

                <span>
                  {product.overall_length || "-"}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

}