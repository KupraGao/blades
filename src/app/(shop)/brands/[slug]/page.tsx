import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { getBrandBySlug } from "@/actions/brands/get-brand-by-slug";
import { getCategories } from "@/actions/categories/get-categories";
import { getProducts } from "@/actions/products/get-products";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import {
  buildCatalogQueryString,
  CATALOG_PAGE_SIZE,
  parseCatalogSearchParams,
} from "@/lib/catalog/catalog-search-params";
import { BrandProductsContent } from "@/components/brands/BrandProductsContent";
import { Header } from "@/components/layout/Header";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
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

  const [catalog, categories, user] = await Promise.all([
    getProducts({
      brandId: String(brand.id),
      categoryId: filters.categoryId ?? undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      limit: CATALOG_PAGE_SIZE,
    }),
    getCategories(),
    getAuthUser(),
  ]);

  if (catalog.totalPages > 0 && filters.page > catalog.totalPages) {
    const qs = buildCatalogQueryString({
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: 1,
    });
    redirect(
      qs
        ? `/brands/${encodeURIComponent(brand.slug)}?${qs}`
        : `/brands/${encodeURIComponent(brand.slug)}`,
    );
  }

  return (
    <>
      <Header
        categories={categories ?? []}
        accountHref={user ? "/account" : "/account/login"}
      />

      <main className="section-pad lg:pt-14">
        <Suspense fallback={null}>
          <BrandProductsContent
            brand={brand}
            products={catalog.products ?? []}
            total={catalog.total}
            currentPage={filters.page}
            totalPages={catalog.totalPages}
            categories={categories ?? []}
          />
        </Suspense>
      </main>
    </>
  );
}
