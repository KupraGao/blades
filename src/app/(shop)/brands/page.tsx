import type { Metadata } from "next";

import { getStorefrontBrands } from "@/actions/brands/get-brands";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { BrandsDirectoryContent } from "@/components/brands/BrandsDirectoryContent";
import { BrandsPageHeading } from "@/components/brands/BrandsPageHeading";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Brands | Blades Premium Store",
  description: "Explore products by brand.",
};

export default async function BrandsPage() {
  const [brands, user] = await Promise.all([
    getStorefrontBrands(),
    getAuthUser(),
  ]);

  return (
    <>
      <Header
        categories={[]}
        accountHref={user ? "/account" : "/account/login"}
      />

      <main className="section-pad">
        <div className="container-page">
          <BrandsPageHeading />
          <BrandsDirectoryContent brands={brands} />
        </div>
      </main>
    </>
  );
}
