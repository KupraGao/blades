"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Heart, Menu, ShoppingBag, UserRound, X } from "lucide-react";

import { MobileMenuDrawer } from "./MobileMenuDrawer";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher, headerCircleControlClassName } from "@/components/common/LanguageSwitcher";

import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type HeaderProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  accountHref?: string;
};

const RAIL_SCROLL_THRESHOLD_PX = 10;
const RAIL_TOP_FORCE_VISIBLE_PX = 16;
const RAIL_TRANSITION_MS = 200;
const RAIL_STAGGER_MS = 40;
const RAIL_ITEM_COUNT = 5;

export function Header({
  categories,
  selectedCategory,
  onSelectCategory,
  accountHref = "/account/login",
}: HeaderProps) {
  const { t } = useLanguage();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // =====================================
  // CART DRAWER STATE
  // =====================================
  const [cartOpen, setCartOpen] = useState(false);

  // =====================================
  // MOBILE DRAWER STATE
  // =====================================
  const [open, setOpen] = useState(false);

  // =====================================
  // MOBILE TABS
  // =====================================
  const [tab, setTab] = useState("categories");

  // =====================================
  // <460px UTILITY RAIL SCROLL VISIBILITY
  // =====================================
  const [railVisible, setRailVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastScrollYRef.current;

      if (y <= RAIL_TOP_FORCE_VISIBLE_PX) {
        setRailVisible(true);
        lastScrollYRef.current = y;
        return;
      }

      if (Math.abs(delta) < RAIL_SCROLL_THRESHOLD_PX) {
        return;
      }

      setRailVisible(delta < 0);
      lastScrollYRef.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showNarrowRail = railVisible && !open;

  function railItemStyle(index: number): CSSProperties {
    const delayMs = showNarrowRail
      ? index * RAIL_STAGGER_MS
      : (RAIL_ITEM_COUNT - 1 - index) * RAIL_STAGGER_MS;

    return {
      transitionProperty: "opacity, transform",
      transitionDuration: `${RAIL_TRANSITION_MS}ms`,
      transitionTimingFunction: "ease-out",
      transitionDelay: `${delayMs}ms`,
    };
  }

  function railItemClassName() {
    return showNarrowRail
      ? "max-[459px]:translate-y-0 max-[459px]:opacity-100"
      : "max-[459px]:pointer-events-none max-[459px]:-translate-y-1 max-[459px]:opacity-0";
  }

  return (
    <>
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-x dark:border-white/10 dark:bg-black/70">
        <div className="container-page flex h-20 items-center justify-between gap-3 lg:gap-6">

          {/* ===================================== */}
          {/* LOGO */}
          {/* ===================================== */}
          <a
            href="/"
            aria-label={t.logoHomeAria}
            className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-2 py-2 sm:px-3"
          >
            <Image
              src="/images/fonis-gareshe-1.png"
              alt={t.logoAlt}
              width={120}
              height={40}
              className="h-9 w-auto max-w-[7.5rem] object-contain sm:h-10"
            />
          </a>

          {/* ===================================== */}
          {/* DESKTOP NAV */}
          {/* ===================================== */}
          <nav className="hidden items-center gap-8 lg:flex">
            <a href="/" className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300">{t.home}</a>
            <a href="/#products" className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300">{t.products}</a>
            <a href="/" className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300">{t.brands}</a>
            <a href="/#contact" className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300">{t.contact}</a>
          </nav>

          {/* ===================================== */}
          {/* ACTIONS */}
          {/* ===================================== */}
          <div className="relative flex shrink-0 items-center gap-2">
            {/*
              >=460px: inline row before burger
              <460px: absolute vertical rail under burger (right-aligned)
            */}
            <div
              className="flex items-center gap-2 max-[459px]:absolute max-[459px]:right-0 max-[459px]:top-full max-[459px]:mt-2 max-[459px]:flex-col max-[459px]:items-center max-[459px]:gap-1.5"
            >
              <div className={railItemClassName()} style={railItemStyle(0)}>
                <LanguageSwitcher />
              </div>

              <div className={railItemClassName()} style={railItemStyle(1)}>
                <ThemeToggle />
              </div>

              <div className={railItemClassName()} style={railItemStyle(2)}>
                <Link
                  href="/wishlist"
                  aria-label={t.wishlist}
                  title={t.wishlist}
                  className={`relative ${headerCircleControlClassName}`}
                >
                  <Heart size={18} strokeWidth={2} />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-orange px-1 text-[11px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className={railItemClassName()} style={railItemStyle(3)}>
                <button
                  type="button"
                  aria-label={t.cart}
                  onClick={() => setCartOpen(true)}
                  className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-orange bg-brand-orange text-white shadow-md shadow-black/15 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange dark:shadow-black/50"
                >
                  <ShoppingBag size={18} strokeWidth={2} />
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-bold text-black shadow-sm">
                    {cartCount}
                  </span>
                </button>
              </div>

              <div className={railItemClassName()} style={railItemStyle(4)}>
                <Link
                  href={accountHref}
                  aria-label={t.account}
                  title={t.account}
                  className={headerCircleControlClassName}
                >
                  <UserRound size={18} strokeWidth={2} />
                </Link>
              </div>
            </div>

            {/* ===================================== */}
            {/* MOBILE MENU TOGGLE */}
            {/* ===================================== */}
            <button
              type="button"
              aria-label={t.menu}
              aria-expanded={open}
              aria-controls="mobile-menu-drawer"
              onClick={() => setOpen((current) => !current)}
              className={`${headerCircleControlClassName} lg:hidden`}
            >
              {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </header>

      {/* ===================================== */}
      {/* CART DRAWER */}
      {/* ===================================== */}
      <CartDrawer open={cartOpen} setOpen={setCartOpen} />

      {/* ===================================== */}
      {/* MOBILE MENU DRAWER */}
      {/* ===================================== */}
      <MobileMenuDrawer
        open={open}
        setOpen={setOpen}
        tab={tab}
        setTab={setTab}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
    </>
  );
}
