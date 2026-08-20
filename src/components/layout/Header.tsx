"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, ShoppingBag, UserRound } from "lucide-react";

import { MobileMenuDrawer } from "./MobileMenuDrawer";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
type HeaderProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  accountHref?: string;
};

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

  return (
    <>
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-x dark:border-white/10 dark:bg-black/70">
        <div className="container-page flex h-20 items-center justify-between gap-6">

          {/* ===================================== */}
          {/* LOGO */}
          {/* ===================================== */}
          <a href="/" aria-label={t.logoHomeAria} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
            <Image src="/images/fonis-gareshe-1.png" alt={t.logoAlt} width={120} height={40} className="h-10 w-auto object-contain" />
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
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* ===================================== */}
            {/* WISHLIST */}
            {/* ===================================== */}
            <Link href="/wishlist" aria-label={t.wishlist} title={t.wishlist} className="relative grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700 transition hover:bg-brand-orange hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-white">
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-orange px-1 text-[11px] font-bold text-white">{wishlistCount}</span>
              )}
            </Link>

            {/* ===================================== */}
            {/* CART */}
            {/* ===================================== */}
            <button type="button" aria-label={t.cart} onClick={() => setCartOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-orange text-white">
              <ShoppingBag size={19} />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] text-black">{cartCount}</span>
            </button>

            {/* ===================================== */}
            {/* ACCOUNT */}
            {/* ===================================== */}
            <Link
              href={accountHref}
              aria-label={t.account}
              title={t.account}
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <UserRound size={19} />
            </Link>

            {/* ===================================== */}
            {/* MOBILE MENU */}
            {/* ===================================== */}
            <button type="button" aria-label={t.menu} onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white lg:hidden">
              <Menu size={21} />
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