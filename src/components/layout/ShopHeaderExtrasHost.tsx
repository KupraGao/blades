"use client";

import { usePathname } from "next/navigation";

import { HeaderExtras } from "@/components/layout/HeaderExtras";

function shouldShowStorefrontToolbar(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname === "/brands" || pathname.startsWith("/brands/")) return true;
  return false;
}

/**
 * Fixed host under the sticky Header so Search/Help stays mounted across
 * Home ↔ Brands navigations (shop layout persistence).
 */
export function ShopHeaderExtrasHost() {
  const pathname = usePathname();

  if (!shouldShowStorefrontToolbar(pathname)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 hidden lg:block">
      <div className="pointer-events-auto">
        <HeaderExtras />
      </div>
    </div>
  );
}
