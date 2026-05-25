"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

const navItems = [
  "მთავარი",
  "კატალოგი",
  "ბრენდები",
  "ფასდაკლება",
  "კონტაქტი",
];

export function Header() {

  const [open, setOpen] =
    useState(false);

  const [tab, setTab] =
    useState("menu");

  return (
    <>
      {/* HEADER */}

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

          {/* LOGO */}

          <a
            href="#"
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

          {/* DESKTOP NAV */}

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

          {/* ACTIONS */}

          <div
            className="
              flex items-center gap-2
            "
          >

            {/* CART */}

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

            {/* USER */}

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

            {/* MOBILE MENU */}

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

      {/* OVERLAY */}

      {open && (

        <div
          className="
            fixed inset-0 z-40
            bg-black/60
          "
          onClick={() => setOpen(false)}
        />

      )}

      {/* SIDEBAR */}

      <div
        className={`
          fixed left-0 top-0 z-50
          h-full w-80 bg-white text-black
          transform transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* SEARCH */}

        <div className="border-b p-4">

          <div className="flex gap-2">

            <input
              type="text"
              placeholder="ძებნა..."
              className="
                flex-1 rounded-lg border
                px-3 py-2 outline-none
              "
            />

            <button
              aria-label="ძებნა"
              className="
                rounded-lg bg-black
                px-3 text-white
              "
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
            className={`
              flex-1 py-2 font-bold
              ${
                tab === "menu"
                  ? "border-b-2 border-black"
                  : "text-gray-400"
              }
            `}
          >

            მენიუ

          </button>

          <button
            aria-label="კატეგორიების ტაბი"
            onClick={() => setTab("categories")}
            className={`
              flex-1 py-2 font-bold
              ${
                tab === "categories"
                  ? "border-b-2 border-black"
                  : "text-gray-400"
              }
            `}
          >

            კატეგორიები

          </button>

        </div>

        {/* CONTENT */}

        <div
          className="
            flex h-[calc(100vh-120px)]
            flex-col
          "
        >

          <div
            className="
              flex-1 overflow-y-auto p-4
            "
          >

            {/* MENU */}

            {tab === "menu" && (

              <div
                className="
                  flex flex-col
                  gap-1 sm:gap-2
                "
              >

                {navItems.map((item) => (

                  <a
                    key={item}
                    href="#"
                    className="
                      rounded-lg bg-gray-100
                      px-4 py-2
                    "
                    onClick={() => setOpen(false)}
                  >

                    {item}

                  </a>

                ))}

              </div>

            )}

            {/* CATEGORIES */}

            {tab === "categories" && (

              <div
                className="
                  flex flex-col
                  gap-1 sm:gap-2
                "
              >

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
                    className="
                      rounded-lg bg-gray-100
                      px-4 py-2
                    "
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