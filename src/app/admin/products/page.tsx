import Link from "next/link";

import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import Pagination from "@/components/admin/Pagination";
import ProductSearch from "@/components/admin/ProductSearch";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductToolbar from "@/components/admin/ProductToolbar";

type Props = {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    brand?: string;
    category?: string;
    stock?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: Props) {

  const {
    search,
    sort,
    brand,
    category,
    stock,
    page,
    limit,
  } = await searchParams;

  const currentPage = Number(page ?? 1);
  const pageSize = Number(limit ?? 5);

  const [
    brands,
    categories,
    {
      products,
      total,
      totalPages,
    },
  ] = await Promise.all([
    getBrands(),
    getCategories(),
    getProducts({
      search,
      sort,
      brandId: brand,
      categoryId: category,
      stock,
      page: currentPage,
      limit: pageSize,
    }),
  ]);

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (

    <div>

      {/* PAGE HEADER */}
      <div className="mb-8 flex flex-wrap items-end gap-4">

        {/* TITLE */}
        <div className="min-w-fit">

          <h1 className="text-4xl font-bold text-white">
            Products
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your products
          </p>

        </div>

        {/* SEARCH */}
        <div className="hidden flex-1 md:block">

          <ProductSearch />

        </div>

        {/* BUTTON */}
        <Link
          href="/admin/products/create"
          className="ml-auto rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Add Product
        </Link>

        {/* MOBILE / TABLET SEARCH */}
        <div className="w-full md:hidden">

          <ProductSearch />

        </div>

      </div>

      {/* PRODUCT TOOLBAR */}
      <ProductToolbar
        brands={brands}
        categories={categories}
      />

      {/* RESULTS COUNTER */}
      <div className="mb-4 text-sm text-zinc-400">
        Showing {from}–{to} of {total} products
      </div>

      {/* PRODUCTS TABLE */}
      <ProductsTable
        products={products}
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
      />

    </div>

  );

}