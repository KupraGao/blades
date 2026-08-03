import Link from "next/link";

import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import Pagination from "@/components/admin/Pagination";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductToolbar from "@/components/admin/ProductToolbar";

type Props={
  searchParams:Promise<{
    search?:string;
    sort?:string;
    brand?:string;
    category?:string;
    stock?:string;
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
    brand,
    category,
    stock,
    page,
    limit,
  }=await searchParams;

  const[
    brands,
    categories,
    {
      products,
      totalPages,
    },
  ]=await Promise.all([
    getBrands(),
    getCategories(),
    getProducts({
      search,
      sort,
      brandId:brand,
      categoryId:category,
      stock,
      page:Number(page??1),
      limit:Number(limit??5),
    }),
  ]);

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

      {/* PRODUCT TOOLBAR */}

      <ProductToolbar
        brands={brands}
        categories={categories}
      />

      {/* PRODUCTS TABLE */}

      <ProductsTable
        products={products}
      />

      {/* PAGINATION */}

      <Pagination
        currentPage={Number(page??1)}
        totalPages={totalPages}
      />

    </div>

  );

}