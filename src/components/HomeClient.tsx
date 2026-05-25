"use client";

import { useState } from "react";

import { Header } from "@/components/Header";
import { HeaderExtras } from "@/components/HeaderExtras";
import { Hero } from "@/components/Hero";
import { PromoBanner } from "@/components/PromoBanner";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";

import { ProductSectionClient } from "@/components/ProductSectionClient";

export function HomeClient({
  products,
}: {
  products: any[];
}) {

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
            pc.categories?.name
        ) ?? []
      )
    )
  ).filter(
    (c): c is string =>
      Boolean(c)
  );

  return (

    <>

      <Header />

      <HeaderExtras />

      <main>

        <Hero />

        <FeatureStrip />

        <ProductSectionClient
          products={products}
          selectedCategory={
            selectedCategory
          }
          onSelectCategory={
            setSelectedCategory
          }
        />

        <PromoBanner />

      </main>

      <Footer />

    </>

  );

}