import { Header } from "@/components/Header";
import { HeaderExtras } from "@/components/HeaderExtras";
import { Hero } from "@/components/Hero";
import { ProductSection } from "@/components/ProductSection";
import { PromoBanner } from "@/components/PromoBanner";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";

export default function Home() {
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