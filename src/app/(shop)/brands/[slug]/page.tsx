import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { getBrandBySlug } from "@/actions/brands/get-brand-by-slug";
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
import {
  resolveStorefrontCatalogQuery,
  toStorefrontFilterCategories,
} from "@/lib/catalog/sale-filter";
import { BrandProductsContent } from "@/components/brands/BrandProductsContent";
import { Header } from "@/components/layout/Header";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
    stock?: string;
    search?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(decodeURIComponent(slug));

  if (!brand) {
    return {
      title: "Brand | Blades Premium Store",
    };
  }

  return {
    title: `${brand.name} | Blades Premium Store`,
  };
}

export default async function BrandProductsPage({
  params,
  searchParams,
}: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const query = await searchParams;
  const filters = parseCatalogSearchParams(query);

  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const [categories, user, storefrontBrands] = await Promise.all([
    getCategories(),
    getAuthUser(),
    getStorefrontBrands(),
  ]);

  const catalogQuery = resolveStorefrontCatalogQuery(
    filters,
    categories ?? [],
  );

  if (catalogQuery.needsSaleUrlCanonicalization) {
    const qs = buildCatalogQueryString({
      categoryId: catalogQuery.urlCategoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      stock: filters.stock,
      search: filters.search,
      page: filters.page > 1 ? filters.page : undefined,
    });
    redirect(
      qs
        ? `/brands/${encodeURIComponent(brand.slug)}?${qs}`
        : `/brands/${encodeURIComponent(brand.slug)}`,
    );
  }

  const catalog = await getProducts({
    brandId: String(brand.id),
    categoryId: catalogQuery.categoryId,
    onSale: catalogQuery.onSale,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort ?? undefined,
    search: filters.search ?? undefined,
    page: filters.page,
    limit: CATALOG_PAGE_SIZE,
  });

  if (catalog.totalPages > 0 && filters.page > catalog.totalPages) {
    const qs = buildCatalogQueryString({
      categoryId: catalogQuery.urlCategoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      stock: filters.stock,
      search: filters.search,
      page: 1,
    });
    redirect(
      qs
        ? `/brands/${encodeURIComponent(brand.slug)}?${qs}`
        : `/brands/${encodeURIComponent(brand.slug)}`,
    );
  }

  const storefrontCategories = toStorefrontFilterCategories(categories ?? []);
  const brands: CatalogBrandOption[] = (storefrontBrands ?? []).map(
    (item) => ({
      slug: item.slug,
      name: item.name,
    }),
  );

  return (
    <>
      <Header
        categories={storefrontCategories}
        accountHref={user ? "/account" : "/account/login"}
        brands={brands}
        routeBrandSlug={brand.slug}
      />

      <main className="section-pad lg:pt-14">
        <Suspense fallback={null}>
          <BrandProductsContent
            brand={brand}
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
