import Link from "next/link";

import { getProducts } from "@/actions/products/get-products";
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

export default async function ProductsPage(){

  const products=await getProducts();

  return(

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

        <Link
          href="/admin/products/create"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Add Product
        </Link>

      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

        {/* HEADER */}
        <div className="grid grid-cols-[80px_1fr_140px_120px_140px] border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400">

          <div>Image</div>
          <div>Product</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Actions</div>

        </div>

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

                {mainImage?(
                  <img
                    src={mainImage.image_url}
                    alt={product.title}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ):(
                  <div className="h-14 w-14 rounded-lg bg-zinc-800"/>
                )}

              </div>

              {/* PRODUCT */}
              <div>

                <h3 className="font-semibold text-white">
                  {product.title}
                </h3>

                <p className="text-sm text-zinc-400">
                  {product.knife_type||"-"}
                </p>

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

    </div>

  );

}