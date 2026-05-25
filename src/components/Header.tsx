"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";

const navItems = ["მთავარი", "კატალოგი", "ბრენდები", "ფასდაკლება", "კონტაქტი"];

export function Header(
  {
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (
    cat: string | null
  ) => void;
}
) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("menu");

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="container-page flex h-20 items-center justify-between gap-6">

          {/* LOGO */}
         <a
  href="#"
  aria-label="მთავარი გვერდი - Blades"
  className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl"
>
  <Image
    src="/images/fonis-gareshe-1.png"
    alt="Blades ლოგო"
    width={120}
    height={40}
    className="object-contain h-10 w-auto"
  />
</a>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-semibold text-zinc-300 transition hover:text-brand-gold"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            {/* CART */}
            <button
              aria-label="კალათა"
              className="relative grid h-11 w-11 place-items-center rounded-full bg-brand-orange text-white"
            >
              <ShoppingBag size={19} />
              <span className="absolute -right-1 -top-1 h-5 w-5 text-[11px] grid place-items-center bg-white text-black rounded-full">
                0
              </span>
            </button>

            {/* USER */}
            <button
              aria-label="პროფილი"
              className="hidden sm:grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            >
              <UserRound size={19} />
            </button>

            {/* MOBILE MENU */}
            <button
              aria-label="მენიუ"
              onClick={() => setOpen(true)}
              className="lg:hidden grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white text-black z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* SEARCH */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ძებნა..."
              className="flex-1 border rounded-lg px-3 py-2 outline-none"
            />

            <button
              aria-label="ძებნა"
              className="bg-black text-white px-3 rounded-lg"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b">
          <button
            aria-label="მენიუ ტაბი"
            onClick={() => setTab("menu")}
            className={`flex-1 py-2 font-bold ${
              tab === "menu" ? "border-b-2 border-black" : "text-gray-400"
            }`}
          >
            მენიუ
          </button>

          <button
            aria-label="კატეგორიების ტაბი"
            onClick={() => setTab("categories")}
            className={`flex-1 py-2 font-bold ${
              tab === "categories" ? "border-b-2 border-black" : "text-gray-400"
            }`}
          >
            კატეგორიები
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="p-4 overflow-y-auto flex-1">

            {/* MENU */}
            {tab === "menu" && (
              <div className="flex flex-col gap-1 sm:gap-2">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="bg-gray-100 rounded-lg px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}

            {/* CATEGORIES */}
            {tab === "categories" && (
              <div className="flex flex-col gap-1 sm:gap-2">
                {[
                  "ყველა დანა",
                  "დასაკეცი",
                  "ფიქსირებული",
                  "ექსკლუზიური / ლიმიტირებული",
                  "მაჩეტე / ნაჯახი",
                  "სამზარეულო",
                  "ტყავის აქსესუარები",
                  "ხელნაკეთი საფულეები",
                  "სანადირო აქსესუარები",
                  "ფანრები",
                  "სასაჩუქრე ნაკრებები",
                  "ფასდაკლება",
                  "აქსესუარები",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="bg-gray-100 rounded-lg px-4 py-2"
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}