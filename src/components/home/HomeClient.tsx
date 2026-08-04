"use client";

import { useState } from "react";

import { Header } from "@/components/layout/Header";
import { HeaderExtras } from "@/components/layout/HeaderExtras";

import { Hero } from "@/components/home/Hero";
import { LatestProductsSlider } from "@/components/product/LatestProductsSlider";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureStrip } from "@/components/home/FeatureStrip";

import { ProductSectionClient } from "@/components/product/ProductSectionClient";

import { useLanguage } from "@/context/LanguageContext";
export function HomeClient({
  products,
}: {
  products: any[];
}) {

  // =====================================
  // LANGUAGE
  // =====================================

  const { language } =
    useLanguage();

  // =====================================
  // SHARED CATEGORY STATE
  // =====================================

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string | null>(
    null
  );

  // =====================================
  // ALL CATEGORIES
  // =====================================

  const allCategories = Array.from(
    new Set(
      products.flatMap((p: any) =>
        p.product_categories?.map(
          (pc: any) =>
            language === "ka"
              ? pc.categories?.name_ka
              : pc.categories?.name_en
        ) ?? []
      )
    )
  ).filter(
    (c): c is string =>
      Boolean(c)
  );

  return (

    <>

      <Header
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <HeaderExtras />

      <main>

        {/* <Hero /> */}

        <LatestProductsSlider
          products={products.slice(0, 10)}
        />

        <FeatureStrip />

        <ProductSectionClient
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <PromoBanner />

      </main>

    </>

  );

}