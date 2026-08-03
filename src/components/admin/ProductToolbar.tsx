"use client";

import ProductBrandFilter from "./ProductBrandFilter";
import ProductCategoryFilter from "./ProductCategoryFilter";
import ProductLimit from "./ProductLimit";
import ProductSearch from "./ProductSearch";
import ProductSort from "./ProductSort";
import ProductStockFilter from "./ProductStockFilter";

type Brand={
  id:number;
  name:string;
  slug:string;
  logo:string|null;
};

type Category={
  id:number;
  name_ka:string;
  name_en:string;
};

type Props={
  brands:Brand[];
  categories:Category[];
};

export default function ProductToolbar({
  brands,
  categories,
}:Props){

  return(

    <div className="mb-8 flex items-center gap-3">

      <ProductSearch />

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