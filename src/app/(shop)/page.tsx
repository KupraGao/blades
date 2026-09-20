import { Suspense } from "react";
import { redirect } from "next/navigation";

import { HomeClient } from "@/components/home/HomeClient";

import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import {
  buildCatalogQueryString,
  CATALOG_PAGE_SIZE,
  LATEST_PRODUCTS_LIMIT,
  parseCatalogSearchParams,
} from "@/lib/catalog/catalog-search-params";

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

  const [latestResult, catalogResult, categories, user] = await Promise.all([
    getProducts({
      page: 1,
      limit: LATEST_PRODUCTS_LIMIT,
    }),
    getProducts({
      page: filters.page,
      limit: CATALOG_PAGE_SIZE,
      categoryId: filters.categoryId ?? undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    }),
    getCategories(),
    getAuthUser(),
  ]);

  if (
    catalogResult.totalPages > 0 &&
    filters.page > catalogResult.totalPages
  ) {
    const query = buildCatalogQueryString({
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: 1,
    });
    redirect(query ? `/?${query}` : "/");
  }

  return (
    <Suspense fallback={null}>
      <HomeClient
        latestProducts={latestResult.products ?? []}
        catalogProducts={catalogResult.products ?? []}
        catalogTotal={catalogResult.total}
        catalogTotalPages={catalogResult.totalPages}
        currentPage={filters.page}
        categories={categories ?? []}
        accountHref={user ? "/account" : "/account/login"}
      />
    </Suspense>
  );
}
