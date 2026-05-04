import { Header } from "@/components/Header";
import { CategoriesSidebar } from "@/components/CategoriesSidebar";
import { HeaderExtras } from "@/components/HeaderExtras";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { ProductSection } from "@/components/ProductSection";
import { PromoBanner } from "@/components/PromoBanner";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />

      {/* 🔥 აქ უნდა იყოს (არა container-ში!) */}
      <CategoriesSidebar />
      <HeaderExtras />
      <main>
        <Hero />
        <FeatureStrip />
        <CategorySection />
        <ProductSection />
        <PromoBanner />
      </main>

      <Footer />
    </>
  );
}