"use client";

import ProductSearch from "./ProductSearch";
import ProductSort from "./ProductSort";
import ProductLimit from "./ProductLimit";

export default function ProductToolbar(){

  return(

    <div className="mb-8 flex items-center gap-3">

      <ProductSearch />

      <ProductSort />

      <ProductLimit />

    </div>

  );

}