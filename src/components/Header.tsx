"use client";

import Image from "next/image";
import { useState } from "react";

import {
  Menu,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

import { useLanguage } from "@/context/LanguageContext";

type HeaderProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (
    category: string | null
  ) => void;
};

export function Header({
  categories,
  selectedCategory,
  onSelectCategory,
}: HeaderProps) {

  const { t } = useLanguage();

  // =====================================
  // MOBILE DRAWER STATE
  // =====================================

  const [open, setOpen] =
    useState(false);

  // =====================================
  // MOBILE TABS
  // =====================================

  const [tab, setTab] =
    useState("categories");

  return (

    <>

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-x dark:border-white/10 dark:bg-black/70">

        <div
          className="container-page flex h-20 items-center justify-between gap-6"
        >

          {/* ===================================== */}
          {/* LOGO */}
          {/* ===================================== */}

          <a
            href="/"
            aria-label="მთავარი გვერდი - Blades"
            className="flex items-center gap-3 rounded-xl bg-white px-3 py-2"
          >

            <Image
              src="/images/fonis-gareshe-1.png"
              alt="Blades ლოგო"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />

          </a>

          {/* ===================================== */}
          {/* DESKTOP NAV */}
          {/* ===================================== */}

          <nav className="hidden items-center gap-8 lg:flex">

            <a
              href="#"
              className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300"
            >
              {t.home}
            </a>

            <a
              href="#"
              className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300"
            >
              {t.products}
            </a>

            <a
              href="#"
              className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300"
            >
              {t.brands}
            </a>

            <a
              href="#"
              className="text-sm font-semibold text-zinc-700 transition hover:text-brand-gold dark:text-zinc-300"
            >
              {t.contact}
            </a>

          </nav>

          {/* ===================================== */}
          {/* ACTIONS */}
          {/* ===================================== */}

          <div
            className="
              flex items-center gap-2
            "
          >

            <LanguageSwitcher />

            <ThemeToggle />

            <button
              aria-label="კალათა"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-orange text-white"
            >

              <ShoppingBag size={19} />

              <span
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] text-black"
              >

                0

              </span>

            </button>

            <button
              aria-label="პროფილი"
              className="hidden h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 sm:grid"
            >

              <UserRound size={19} />

            </button>

            <button
              aria-label="მენიუ"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white lg:hidden"
            >

              <Menu size={21} />

            </button>

          </div>

        </div>

      </header>

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