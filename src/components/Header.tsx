"use client";

import Image from "next/image";
import { useState } from "react";

import {
  Menu,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { MobileMenuDrawer } from "./MobileMenuDrawer";

const navItems = [
  "მთავარი",
  "კატალოგი",
  "ბრენდები",
  "ფასდაკლება",
  "კონტაქტი",
];

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

  // =====================================
  // MOBILE DRAWER STATE
  // =====================================

  const [open, setOpen] =
    useState(false);

  // =====================================
  // MOBILE TABS
  // =====================================

  const [tab, setTab] =
    useState("menu");

  return (

    <>

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <header
        className="
          sticky top-0 z-50
          border-b border-white/10
          bg-black/70 backdrop-blur-xl
        "
      >

        <div
          className="
            container-page flex h-20
            items-center justify-between gap-6
          "
        >

          {/* ===================================== */}
          {/* LOGO */}
          {/* ===================================== */}

          <a
            href="/"
            aria-label="მთავარი გვერდი - Blades"
            className="
              flex items-center gap-3
              rounded-xl bg-white
              px-3 py-2
            "
          >

            <Image
              src="/images/fonis-gareshe-1.png"
              alt="Blades ლოგო"
              width={120}
              height={40}
              className="
                h-10 w-auto
                object-contain
              "
            />

          </a>

          {/* ===================================== */}
          {/* DESKTOP NAV */}
          {/* ===================================== */}

          <nav
            className="
              hidden items-center
              gap-8 lg:flex
            "
          >

            {navItems.map((item) => (

              <a
                key={item}
                href="#"
                className="
                  text-sm font-semibold
                  text-zinc-300 transition
                  hover:text-brand-gold
                "
              >

                {item}

              </a>

            ))}

          </nav>

          {/* ===================================== */}
          {/* ACTIONS */}
          {/* ===================================== */}

          <div
            className="
              flex items-center gap-2
            "
          >

            <button
              aria-label="კალათა"
              className="
                relative grid h-11 w-11
                place-items-center rounded-full
                bg-brand-orange text-white
              "
            >

              <ShoppingBag size={19} />

              <span
                className="
                  absolute -right-1 -top-1
                  grid h-5 w-5 place-items-center
                  rounded-full bg-white
                  text-[11px] text-black
                "
              >

                0

              </span>

            </button>

            <button
              aria-label="პროფილი"
              className="
                hidden h-11 w-11
                place-items-center rounded-full
                border border-white/10
                bg-white/5 text-zinc-300
                hover:bg-white/10 sm:grid
              "
            >

              <UserRound size={19} />

            </button>

            <button
              aria-label="მენიუ"
              onClick={() => setOpen(true)}
              className="
                grid h-11 w-11
                place-items-center rounded-full
                border border-white/10
                bg-white/5 text-white
                lg:hidden
              "
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