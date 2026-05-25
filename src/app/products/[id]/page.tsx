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

  const product = await getSingleProduct(id);

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
        {/* PRODUCT GALLERY */}
        {/* ===================================== */}

        <ProductGallery
          title={product.title}
          images={product.product_images || []}
        />

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