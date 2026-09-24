"use client";

import { Phone, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";
import { STORE_CONTACT } from "@/lib/storefront/contact";

function shouldShowStorefrontToolbar(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname === "/brands" || pathname.startsWith("/brands/")) return true;
  return false;
}

function supportsCatalogFiltersSlot(pathname: string | null): boolean {
  if (!pathname) return false;
  // Home + Brand PLP reserve Filters geometry. Brands directory does not.
  if (pathname === "/") return true;
  if (pathname.startsWith("/brands/")) return true;
  return false;
}

/**
 * Shared storefront toolbar (Search + Help).
 * Hosted from (shop) layout so it survives Home ↔ Brands client navigations.
 *
 * `/` and `/brands/[slug]`: reserves left Filters column (272px) for CategoriesSidebar.
 * `/brands`: column collapses; Search expands. No Filters control.
 */
export function HeaderExtras() {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (!shouldShowStorefrontToolbar(pathname)) {
    return null;
  }

  const showFiltersSlot = supportsCatalogFiltersSlot(pathname);

  return (
    <div className="border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="container-page">
        <div className="flex items-center py-1">
          {/*
            Filters geometry (272px) + its own right spacing (24px = gap-6).
            Slot max-width animates 296 → 0 so no leftover parent gap before Search.
            Visibility is route capability — not sidebar open/closed.
          */}
          <div
            className={`overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
              showFiltersSlot
                ? "max-w-[296px] translate-x-0 opacity-100"
                : "pointer-events-none max-w-0 -translate-x-3 opacity-0"
            }`}
            aria-hidden
          >
            <div className="flex h-12 w-[296px] shrink-0">
              <div className="w-[272px] shrink-0" />
              <div className="w-6 shrink-0" />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-6">
            {/* SEARCH */}
            <div className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-sm">
              <input
                type="text"
                placeholder={t.search}
                className="h-full min-w-0 flex-1 bg-white px-4 text-sm text-black outline-none"
              />

              <button
                type="button"
                aria-label={t.search}
                className="flex h-full shrink-0 items-center bg-black px-4 text-white transition hover:text-orange-400"
              >
                <Search size={18} />
              </button>
            </div>

            {/* HELP / SUPPORT */}
            <a
              href={`tel:${STORE_CONTACT.phones[0].tel}`}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm text-white"
            >
              <Phone size={18} />

              <div className="leading-tight">
                <p className="text-xs text-zinc-400">{t.support247}</p>

                <p className="text-base font-semibold text-white transition hover:text-orange-400">
                  {STORE_CONTACT.phones[0].display}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
