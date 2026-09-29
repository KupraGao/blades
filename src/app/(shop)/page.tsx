import { Suspense } from "react";

import { HomeClient } from "@/components/home/HomeClient";

import { getStorefrontBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getHomeDiscoveryProducts } from "@/actions/products/get-home-discovery-products";
import { getProducts } from "@/actions/products/get-products";
import { getSaleSliderProducts } from "@/actions/products/get-sale-slider-products";
import { getActivePromoBanners } from "@/actions/promos/get-active-promo-banners";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { fetchLatestYoutubeVideos } from "@/lib/youtube/fetch-latest-videos";
import {
  LATEST_PRODUCTS_LIMIT,
  type CatalogBrandOption,
} from "@/lib/catalog/catalog-search-params";
import { toStorefrontFilterCategories } from "@/lib/catalog/sale-filter";

export default async function Home() {
  const [categories, user, storefrontBrands] = await Promise.all([
    getCategories(),
    getAuthUser(),
    getStorefrontBrands(),
  ]);

  const [latestResult, discovery, saleProducts, promoBanners, youtubeVideos] =
    await Promise.all([
      getProducts({
        page: 1,
        limit: LATEST_PRODUCTS_LIMIT,
      }),
      getHomeDiscoveryProducts(),
      getSaleSliderProducts(),
      getActivePromoBanners(),
      fetchLatestYoutubeVideos(),
    ]);

  const storefrontCategories = toStorefrontFilterCategories(categories ?? []);
  const brands: CatalogBrandOption[] = (storefrontBrands ?? []).map(
    (brand) => ({
      slug: brand.slug,
      name: brand.name,
    }),
  );

  return (
    <Suspense fallback={null}>
      <HomeClient
        latestProducts={latestResult.products ?? []}
        saleProducts={saleProducts}
        promoBanners={promoBanners}
        youtubeVideos={youtubeVideos}
        discoveryProducts={discovery.products}
        discoveryCatalogSize={discovery.catalogSize}
        categories={storefrontCategories}
        brands={brands}
        accountHref={user ? "/account" : "/account/login"}
      />
    </Suspense>
  );
}
