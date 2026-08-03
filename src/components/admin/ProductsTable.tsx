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
};

export default function ProductsTable({
  products,
}: Props) {

  return (

    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">

      <div className="min-w-[900px]">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-[80px_1fr_140px_120px_140px] border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400">

          <div>Image</div>
          <div>Product</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Actions</div>

        </div>

        {/* TABLE BODY */}
        {products.map((product) => {

          const mainImage =
            product.product_images.find(image => image.is_main)
            ?? product.product_images[0];

          return (

            <div
              key={product.id}
              className="grid grid-cols-[80px_1fr_140px_120px_140px] items-center border-b border-zinc-800 px-6 py-4"
            >

              {/* IMAGE */}
              <div>

                <Link
                  href={`/products/${product.id}`}
                  target="_blank"
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

              </div>

              {/* PRODUCT */}
              <div>

                <Link
                  href={`/products/${product.id}`}
                  target="_blank"
                  className="group"
                >

                  <h3 className="font-semibold text-white transition group-hover:text-zinc-300">
                    {product.title}
                  </h3>

                  <p className="text-sm text-zinc-400">
                    {product.knife_type || "-"}
                  </p>

                </Link>

              </div>

              {/* PRICE */}
              <div className="font-medium text-white">
                ${product.price}
              </div>

              {/* STOCK */}
              <div>

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    product.stock > 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {product.stock > 0
                    ? "In Stock"
                    : "Out OfStock"}
                </span>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white transition hover:bg-zinc-700"
                >
                  Edit
                </Link>

                <DeleteProductButton
                  productId={product.id}
                />

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}