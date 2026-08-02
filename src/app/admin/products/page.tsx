import Link from "next/link";

import { getProducts } from "@/actions/products/get-products";
import ProductSearch from "@/components/admin/ProductSearch";
import ProductSort from "@/components/admin/ProductSort";
import Pagination from "@/components/admin/Pagination";
import ProductLimit from "@/components/admin/ProductLimit";
import DeleteProductButton from "./DeleteProductButton";

type ProductImage={
  id:number;
  image_url:string;
  is_main:boolean;
};

type Product={
  id:string;
  title:string;
  knife_type:string|null;
  price:number;
  stock:number;
  product_images:ProductImage[];
};

type Props={
  searchParams:Promise<{
    search?:string;
    sort?:string;
    page?:string;
    limit?:string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}:Props){

const{
  search,
  sort,
  page,
  limit,
}=await searchParams;

const{
  products,
  totalPages,
}=await getProducts({
  search,
  sort,
  page:Number(page??1),
  limit:Number(limit??20),
});

  return(

    <div>

      {/* PAGE HEADER */}
      <div className="mb-8 flex items-center justify-between gap-6">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Products
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your products
          </p>

        </div>

        <Link
          href="/admin/products/create"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Add Product
        </Link>

      </div>

      {/* PRODUCT CONTROLS */}
      <div className="mb-8 flex items-center gap-3">

        <ProductSearch />

        <ProductSort />

        <ProductLimit />

      </div>

      {/* PRODUCTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-[80px_1fr_140px_120px_140px] border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400">

          <div>Image</div>
          <div>Product</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Actions</div>

        </div>

        {/* TABLE BODY */}
        {products.map((product:Product)=>{

          const mainImage=
            product.product_images.find(image=>image.is_main)
            ??product.product_images[0];

          return(

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

                  {mainImage?(

                    <img
                      src={mainImage.image_url}
                      alt={product.title}
                      className="h-14 w-14 rounded-lg object-cover transition duration-300 hover:scale-105"
                    />

                  ):(

                    <div className="h-14 w-14 rounded-lg bg-zinc-800"/>

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
                    {product.knife_type||"-"}
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
                    product.stock>0
                      ?"bg-green-500/20 text-green-400"
                      :"bg-red-500/20 text-red-400"
                  }`}
                >
                  {product.stock>0
                    ?"In Stock"
                    :"Out Of Stock"}
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

      {/* PAGINATION */}

      <Pagination
        currentPage={Number(page??1)}
        totalPages={totalPages}
      />

    </div>

  );

}