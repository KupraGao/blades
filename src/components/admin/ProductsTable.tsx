import Link from "next/link";

import DeleteProductButton from "@/app/admin/products/DeleteProductButton";

type ProductImage = {
  id: number;
  image_url: string;
  is_main: boolean;
};

type Product = {
  id: string;
  title: string;
  knife_type: string | null;
  price: number;
  stock: number;
  product_images: ProductImage[];
};

type Props = {
  products: Product[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  onToggleAll: () => void;
};

export default function ProductsTable({
  products,
  selectedProducts,
  onToggleProduct,
  onToggleAll,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {/* TABLE HEADER */}
      <div className="hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 text-sm font-semibold text-zinc-400 sm:grid sm:grid-cols-[40px_minmax(0,1fr)_150px] sm:gap-4 md:grid-cols-[40px_minmax(0,1fr)_110px_150px] lg:grid-cols-[40px_80px_minmax(0,1fr)_120px_130px_150px] lg:px-6">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={
              products.length > 0 && selectedProducts.length === products.length
            }
            onChange={onToggleAll}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
          />
        </div>

        <div className="hidden lg:block">Image</div>

        <div>Product</div>

        <div className="hidden md:block">Price</div>

        <div className="hidden lg:block">Stock</div>

        <div className="text-right">Actions</div>
      </div>

      {/* TABLE BODY */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-lg font-semibold text-white">No products found</p>

          <p className="mt-2 text-sm text-zinc-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        products.map((product) => {
          const mainImage =
            product.product_images.find((image) => image.is_main) ??
            product.product_images[0];

          return (
            <div
              key={product.id}
              className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 last:border-b-0 sm:grid sm:grid-cols-[40px_minmax(0,1fr)_150px] sm:items-center sm:gap-4 md:grid-cols-[40px_minmax(0,1fr)_110px_150px] lg:grid-cols-[40px_80px_minmax(0,1fr)_120px_130px_150px] lg:px-6"
            >
              {/* SELECT PRODUCT */}
              <div className="hidden items-center justify-center sm:flex">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => onToggleProduct(product.id)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                />
              </div>

              {/* IMAGE */}
              <div className="hidden lg:block">
                <Link href={`/products/${product.id}`} target="_blank">
                  {mainImage ? (
                    <img
                      src={mainImage.image_url}
                      alt={product.title}
                      className="h-14 w-14 rounded-lg object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-zinc-800" />
                  )}
                </Link>
              </div>

              {/* PRODUCT */}
              <div className="flex min-w-0 items-center gap-4">
                <div className="sm:hidden">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => onToggleProduct(product.id)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                  />
                </div>

                <Link
                  href={`/products/${product.id}`}
                  target="_blank"
                  className="shrink-0 lg:hidden"
                >
                  {mainImage ? (
                    <img
                      src={mainImage.image_url}
                      alt={product.title}
                      className="h-14 w-14 rounded-lg object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-zinc-800" />
                  )}
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    target="_blank"
                    className="group"
                  >
                    <h3 className="truncate font-semibold text-white transition group-hover:text-zinc-300">
                      {product.title}
                    </h3>

                    <p className="truncate text-sm text-zinc-400">
                      {product.knife_type || "-"}
                    </p>
                  </Link>

                  {/* MOBILE PRICE */}
                  <p className="mt-2 font-medium text-white md:hidden">
                    ${product.price}
                  </p>

                  {/* MOBILE STOCK */}
                  <div className="mt-2 lg:hidden">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs ${
                        product.stock > 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out Of Stock"}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRICE */}
              <div className="hidden font-medium text-white md:block">
                ${product.price}
              </div>

              {/* STOCK */}
              <div className="hidden lg:block">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm ${
                    product.stock > 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out Of Stock"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex shrink-0 gap-2 sm:justify-end">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white transition hover:bg-zinc-700"
                >
                  Edit
                </Link>

                <DeleteProductButton productId={product.id} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
