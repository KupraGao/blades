"use client";

import { Header } from "@/components/layout/Header";

// =================================================
// STOREFRONT HEADER FOR AUTHENTICATED ACCOUNT
// =================================================
// Reuses the shared shop Header (language, theme, wishlist,
// cart, account, mobile menu). Category filters are home-only.
// =================================================

export function AccountStorefrontHeader() {
  return (
    <Header
      categories={[]}
      selectedCategory={null}
      onSelectCategory={() => {}}
      accountHref="/account"
    />
  );
}
