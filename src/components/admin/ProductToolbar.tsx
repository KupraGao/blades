"use client";

import ProductBrandFilter from "./ProductBrandFilter";
import ProductCategoryFilter from "./ProductCategoryFilter";
import ProductLimit from "./ProductLimit";
import ProductSearch from "./ProductSearch";
import ProductSort from "./ProductSort";
import ProductStockFilter from "./ProductStockFilter";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

type Category = {
  id: number;
  name_ka: string;
  name_en: string;
};

type Props = {
  brands: Brand[];
  categories: Category[];
};

export default function ProductToolbar({
  brands,
  categories,
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">

      <div className="w-full lg:w-auto">
        <ProductSearch />
      </div>

      <div className="w-full sm:grid sm:grid-cols-2 sm:gap-3 lg:flex lg:w-auto lg:items-center">

        <ProductSort />

        <ProductBrandFilter
          brands={brands}
        />

        <ProductCategoryFilter
          categories={categories}
        />

        <ProductStockFilter />

        <ProductLimit />

      </div>

    </div>
  );
}