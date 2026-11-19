import { redirect } from "next/navigation";

import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import Pagination from "@/components/admin/products/list/Pagination";
import ProductBulkTable from "@/components/admin/products/list/ProductBulkTable";
import ProductSearch from "@/components/admin/products/list/ProductSearch";
import ProductToolbar from "@/components/admin/products/list/ProductToolbar";
import ProductsPageHeader from "@/components/admin/products/list/ProductsPageHeader";
import ProductsResultsCounter from "@/components/admin/products/list/ProductsResultsCounter";
import { CatalogLoadError } from "@/components/product/CatalogLoadError";

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

function positiveInteger(value: string | undefined, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 ? Math.floor(number) : fallback;
}

export default async function ProductsPage({
  searchParams,
}: Props) {

  const params = await searchParams;
  const {
    search,
    sort,
    brand,
    category,
    stock,
    page,
    limit,
  } = params;

  const currentPage = positiveInteger(page, 1);
  const pageSize = positiveInteger(limit, 5);

  const [
    brands,
    categories,
    catalog,
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

  if (catalog && currentPage > Math.max(1, catalog.totalPages)) {
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (typeof value === "string") query.set(name, value);
    }
    query.set("page", String(Math.max(1, catalog.totalPages)));
    redirect(`/admin/products?${query}`);
  }

  return (

    <div>

      <ProductsPageHeader search={<ProductSearch />} />

      <ProductToolbar
        brands={brands}
        categories={categories}
      />

      {catalog ? (
        <>
          <ProductsResultsCounter
            from={catalog.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            to={Math.min(currentPage * pageSize, catalog.total)}
            total={catalog.total}
          />
          <ProductBulkTable products={catalog.products} categories={categories} />
          {catalog.totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={catalog.totalPages} />
          )}
        </>
      ) : (
        <CatalogLoadError />
      )}

    </div>

  );

}
