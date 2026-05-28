"use client";

import { ProductCard } from "./ProductCard";
import { CategoriesSidebar } from "./CategoriesSidebar";

type ProductSectionClientProps = {
  products: any[];

  selectedCategory: string | null;

  onSelectCategory: (
    category: string | null
  ) => void;
};

export function ProductSectionClient({
  products,
  selectedCategory,
  onSelectCategory,
}: ProductSectionClientProps) {

  // =====================================
  // SAFE PRODUCTS
  // =====================================

  const safeProducts =
    Array.isArray(products)
      ? products
      : [];

  // =====================================
  // ALL CATEGORIES
  // =====================================

  const allCategories = Array.from(
    new Set(
      safeProducts.flatMap(
        (p: any) =>
          p.product_categories?.map(
            (pc: any) =>
              pc.categories?.name
          ) ?? []
      )
    )
  ).filter(
    (c): c is string =>
      Boolean(c)
  );

  // =====================================
  // FILTERED PRODUCTS
  // =====================================

  const filteredProducts =
    selectedCategory
      ? safeProducts.filter(
          (product: any) =>
            product.product_categories?.some(
              (pc: any) =>
                pc.categories?.name ===
                selectedCategory
            )
        )
      : safeProducts;

  return (

    <section
      id="products"
      className="
        section-pad
        bg-black/25
      "
    >

      <div className="container-page">

        {/* ===================================== */}
        {/* DESKTOP SIDEBAR */}
        {/* ===================================== */}

        <CategoriesSidebar
          categories={allCategories}
          selectedCategory={
            selectedCategory
          }
          onSelectCategory={
            onSelectCategory
          }
        />

        {/* ===================================== */}
        {/* SECTION TITLE */}
        {/* ===================================== */}

        <div
          className="
            flex flex-col gap-6
          "
        >

          <p className="small-label">
            featured products
          </p>

          <h2 className="section-title">
            რჩეული პროდუქტები
          </h2>

        </div>

        {/* ===================================== */}
        {/* PRODUCTS GRID */}
        {/* ===================================== */}

        <div
          className="
            mt-10 grid gap-6
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
            2xl:grid-cols-5
          "
        >

          {filteredProducts.map(
            (product: any) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            )
          )}

        </div>

      </div>

    </section>

  );

}