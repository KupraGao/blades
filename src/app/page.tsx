import { Header } from "@/components/Header";
import { HeaderExtras } from "@/components/HeaderExtras";
import { Hero } from "@/components/Hero";
import { ProductSection } from "@/components/ProductSection";
import { PromoBanner } from "@/components/PromoBanner";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";

import { getProducts } from "@/actions/products/get-products";

export default async function Home() {

  const products = await getProducts();

  console.log(products);

  return (
    <>
      <Header />

      <HeaderExtras />

      <main>
        <Hero />
        <FeatureStrip />
        <ProductSection />
        <PromoBanner />
      </main>

      <Footer />
    </>
  );
}