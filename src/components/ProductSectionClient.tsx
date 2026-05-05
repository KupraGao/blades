"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { CategoriesSidebar } from "./CategoriesSidebar";

export function ProductSectionClient({ products }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allCategories = Array.from(
    new Set(
      products.flatMap((p: any) =>
        p.product_categories.map((pc: any) => pc.categories?.name)
      )
    )
  ).filter((c): c is string => Boolean(c));

  const filteredProducts = selectedCategory
    ? products.filter((product: any) =>
        product.product_categories.some(
          (pc: any) => pc.categories.name === selectedCategory
        )
      )
    : products;

  return (
    <section id="products" className="section-pad bg-black/25">
      <div className="container-page">

        {/* 🔥 Sidebar */}
        <CategoriesSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* HEADER */}
        <div className="flex flex-col gap-6">
          <p className="small-label">featured products</p>
          <h2 className="section-title">რჩეული პროდუქტები</h2>
        </div>

        {/* TOP FILTER BUTTONS */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="btn-primary"
          >
            ყველა
          </button>

          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="btn-secondary"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}