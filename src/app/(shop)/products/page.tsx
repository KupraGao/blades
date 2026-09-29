import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getStorefrontBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import {
  buildCatalogQueryString,
  CATALOG_PAGE_SIZE,
  parseCatalogSearchParams,
  type CatalogBrandOption,
} from "@/lib/catalog/catalog-search-params";
import { resolveCatalogBrandQuery } from "@/lib/catalog/resolve-catalog-brand";
import {
  resolveStorefrontCatalogQuery,
  toStorefrontFilterCategories,
} from "@/lib/catalog/sale-filter";
import { Header } from "@/components/layout/Header";
import { ProductsPageContent } from "@/components/product/ProductsPageContent";

type Props = {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    brand?: string;
    stock?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);

  const [categories, user, storefrontBrands, catalogBrand] = await Promise.all([
    getCategories(),
    getAuthUser(),
    getStorefrontBrands(),
    resolveCatalogBrandQuery(filters.brandSlug),
  ]);

  const catalogQuery = resolveStorefrontCatalogQuery(
    filters,
    categories ?? [],
  );

  if (catalogQuery.needsSaleUrlCanonicalization) {
    const query = buildCatalogQueryString({
      categoryId: catalogQuery.urlCategoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      brandSlug: filters.brandSlug,
      stock: filters.stock,
      sort: filters.sort,
      page: filters.page > 1 ? filters.page : undefined,
    });
    redirect(query ? `/products?${query}` : "/products");
  }

  const catalog = catalogBrand.unknownBrand
    ? { products: [], total: 0, totalPages: 0 }
    : await getProducts({
        page: filters.page,
        limit: CATALOG_PAGE_SIZE,
        categoryId: catalogQuery.categoryId,
        onSale: catalogQuery.onSale,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        brandId: catalogBrand.brandId,
        stock: filters.stock ?? undefined,
        sort: filters.sort ?? undefined,
      });

  if (catalog.totalPages > 0 && filters.page > catalog.totalPages) {
    const query = buildCatalogQueryString({
      categoryId: catalogQuery.urlCategoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      brandSlug: filters.brandSlug,
      stock: filters.stock,
      sort: filters.sort,
      page: 1,
    });
    redirect(query ? `/products?${query}` : "/products");
  }

  const storefrontCategories = toStorefrontFilterCategories(categories ?? []);
  const brands: CatalogBrandOption[] = (storefrontBrands ?? []).map(
    (brand) => ({
      slug: brand.slug,
      name: brand.name,
    }),
  );

  return (
    <>
      <Header
        categories={storefrontCategories}
        accountHref={user ? "/account" : "/account/login"}
        brands={brands}
      />

      <main className="section-pad lg:pt-14">
        <Suspense fallback={null}>
          <ProductsPageContent
            products={catalog.products ?? []}
            total={catalog.total}
            currentPage={filters.page}
            totalPages={catalog.totalPages}
            categories={storefrontCategories}
            brands={brands}
          />
        </Suspense>
      </main>
    </>
  );
}
