"use client";

import { ProductCard } from "./ProductCard";
import { CategoriesSidebar } from "./CategoriesSidebar";
import { useLanguage } from "@/context/LanguageContext";

type ProductSectionClientProps = {
  products: any[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export function ProductSectionClient({
  products,
  selectedCategory,
  onSelectCategory,
}: ProductSectionClientProps) {
  const { t } = useLanguage();

  const safeProducts = Array.isArray(products) ? products : [];

  const allCategories = Array.from(
    new Set(
      safeProducts.flatMap(
        (p: any) =>
          p.product_categories?.map((pc: any) => pc.categories?.name) ?? []
      )
    )
  ).filter((c): c is string => Boolean(c));

  const filteredProducts = selectedCategory
    ? safeProducts.filter((product: any) =>
        product.product_categories?.some(
          (pc: any) => pc.categories?.name === selectedCategory
        )
      )
    : safeProducts;

  return (
    <section id="products" className="section-pad bg-black/25">
      <div className="container-page">
        <CategoriesSidebar
          categories={allCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />

        <div className="flex flex-col gap-6">
          <p className="small-label">{t.featuredProducts}</p>
          <h2 className="section-title">{t.featuredProducts}</h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}