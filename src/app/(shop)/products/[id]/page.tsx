import ProductGallery from "@/components/ProductGallery";
import { getSingleProduct } from "@/actions/products/get-single-product";
import ProductDetailsContent from "@/components/ProductDetailsContent";

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
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
        <div>
          <ProductGallery
            title={product.title}
            images={product.product_images || []}
          />

          {product.review_link && (
            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-bold">
                <ProductDetailsContent
                  label="videoReview"
                />
              </h2>

              <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <iframe
                  width="100%"
                  height="450"
                  src={product.review_link
                    .replace("watch?v=", "embed/")
                    .replace("youtu.be/", "youtube.com/embed/")}
                  title="Product Review"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {product.title}
          </h1>

          <p className="mt-6 text-3xl font-semibold">
            ₾ {product.price}
          </p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <div className="inline-flex items-center rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500">
                <ProductDetailsContent label="inStock" /> • {product.stock} <ProductDetailsContent label="pieces" />              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500">
                <ProductDetailsContent label="outOfStock" />
              </div>
            )}
          </div>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                <ProductDetailsContent label="quantity" />
              </span>

              <div className="flex items-center overflow-hidden rounded-2xl border border-zinc-300 dark:border-zinc-700">
                <button
                  type="button"
                  className="px-4 py-2 transition hover:bg-zinc-200 dark:hover:bg-white/10"
                >
                  -
                </button>

                <span className="px-5">
                  1
                </span>

                <button
                  type="button"
                  className="px-4 py-2 transition hover:bg-zinc-200 dark:hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button aria-label="Add to wishlist" title="Add to wishlist" type="button"
                className="flex-1 rounded-2xl bg-zinc-900 px-6 py-4 font-bold text-white transition hover:scale-[1.02] dark:bg-white dark:text-black"
              >
                <ProductDetailsContent label="addToCart" />
              </button>

              <button
                type="button"
                className="rounded-2xl border border-zinc-300 px-6 py-4 transition hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-white/10"
              >
                ♡
              </button>
            </div>
          </div>

          <p className="mt-6 leading-7 text-gray-700 dark:text-gray-400">
            {product.description}
          </p>

          <div className="mt-10 space-y-4">
            <h2 className="text-2xl font-bold">
              <ProductDetailsContent label="specifications" />
            </h2>

            <div className="grid gap-4">

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="bladeSteel" />
    </span>
    <span>{product.blade_steel || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="bladeThickness" />
    </span>
    <span>{product.blade_thickness || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="bladeLength" />
    </span>
    <span>{product.blade_length || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="handleMaterial" />
    </span>
    <span>{product.handle_material || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="lockingType" />
    </span>
    <span>{product.locking_type || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="knifeType" />
    </span>
    <span>{product.knife_type || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="weight" />
    </span>
    <span>{product.weight || "-"}</span>
  </div>

  <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
    <span className="font-medium">
      <ProductDetailsContent label="overallLength" />
    </span>
    <span>{product.overall_length || "-"}</span>
  </div>

</div>
          </div>
        </div>
      </div>
    </main>
  );
}