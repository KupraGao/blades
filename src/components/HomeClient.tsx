"use client";

import { useState } from "react";

import { Header } from "@/components/Header";
import { HeaderExtras } from "@/components/HeaderExtras";

import { Hero } from "@/components/Hero";
import { LatestProductsSlider } from "@/components/LatestProductsSlider";
import { PromoBanner } from "@/components/PromoBanner";
import { FeatureStrip } from "@/components/FeatureStrip";

import { ProductSectionClient } from "@/components/ProductSectionClient";

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