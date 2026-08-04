"use client";

import ProductBrandFilter from "./ProductBrandFilter";
import ProductCategoryFilter from "./ProductCategoryFilter";
import ProductLimit from "./ProductLimit";
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

    <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">

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

  );

}