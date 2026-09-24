import CartPageContent from "@/components/cart/CartPageContent";
import { StorefrontHeader } from "@/components/layout/StorefrontHeader";

export default function CartPage() {
  return (
    <>
      <StorefrontHeader />
      <main className="min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <CartPageContent />
        </div>
      </main>
    </>
  );
}