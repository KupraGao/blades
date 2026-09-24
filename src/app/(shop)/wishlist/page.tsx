import WishlistPageContent from "@/components/wishlist/WishlistPageContent";
import { StorefrontHeader } from "@/components/layout/StorefrontHeader";

export default function WishlistPage() {
  return (
    <>
      <StorefrontHeader />
      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <WishlistPageContent />
        </div>
      </main>
    </>
  );
}