import { Suspense } from "react";
import { redirect } from "next/navigation";

import { HomeClient } from "@/components/home/HomeClient";

import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import { getSaleSliderProducts } from "@/actions/products/get-sale-slider-products";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import {
  buildCatalogQueryString,
  CATALOG_PAGE_SIZE,
  LATEST_PRODUCTS_LIMIT,
  parseCatalogSearchParams,
} from "@/lib/catalog/catalog-search-params";
import {
  resolveStorefrontCatalogQuery,
  toStorefrontFilterCategories,
} from "@/lib/catalog/sale-filter";

type Props = {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);

  const [categories, user] = await Promise.all([
    getCategories(),
    getAuthUser(),
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
      page: filters.page > 1 ? filters.page : undefined,
    });
    redirect(query ? `/?${query}` : "/");
  }

  const [latestResult, catalogResult, saleProducts] = await Promise.all([
    getProducts({
      page: 1,
      limit: LATEST_PRODUCTS_LIMIT,
    }),
    getProducts({
      page: filters.page,
      limit: CATALOG_PAGE_SIZE,
      categoryId: catalogQuery.categoryId,
      onSale: catalogQuery.onSale,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    }),
    getSaleSliderProducts(),
  ]);

  if (
    catalogResult.totalPages > 0 &&
    filters.page > catalogResult.totalPages
  ) {
    const query = buildCatalogQueryString({
      categoryId: catalogQuery.urlCategoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: 1,
    });
    redirect(query ? `/?${query}` : "/");
  }

  const storefrontCategories = toStorefrontFilterCategories(categories ?? []);

  return (
    <Suspense fallback={null}>
      <HomeClient
        latestProducts={latestResult.products ?? []}
        saleProducts={saleProducts}
        catalogProducts={catalogResult.products ?? []}
        catalogTotal={catalogResult.total}
        catalogTotalPages={catalogResult.totalPages}
        currentPage={filters.page}
        categories={storefrontCategories}
        accountHref={user ? "/account" : "/account/login"}
      />
    </Suspense>
  );
}
