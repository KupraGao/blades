import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import Pagination from "@/components/admin/products/list/Pagination";
import ProductBulkTable from "@/components/admin/products/list/ProductBulkTable";
import ProductSearch from "@/components/admin/products/list/ProductSearch";
import ProductToolbar from "@/components/admin/products/list/ProductToolbar";
import ProductsPageHeader from "@/components/admin/products/list/ProductsPageHeader";
import ProductsResultsCounter from "@/components/admin/products/list/ProductsResultsCounter";

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

      <ProductsPageHeader search={<ProductSearch />} />

      <ProductToolbar
        brands={brands}
        categories={categories}
      />

      <ProductsResultsCounter
        from={from}
        to={to}
        total={total}
      />

      <ProductBulkTable
        products={products}
        categories={categories}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
      />

    </div>

  );

}
