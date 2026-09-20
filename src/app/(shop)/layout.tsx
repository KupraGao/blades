import { Footer } from "@/components/layout/Footer";
import { ShopHeaderExtrasHost } from "@/components/layout/ShopHeaderExtrasHost";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ShopHeaderExtrasHost />
      <Footer />
    </>
  );
}
