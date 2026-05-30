"use client";

import { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react";

type CategoriesSidebarProps = {
  categories?: string[];
  selectedCategory?: string | null;
  onSelectCategory?: (
    cat: string | null
  ) => void;
};

export function CategoriesSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoriesSidebarProps) {

  // =====================================
  // SAFE PROPS
  // =====================================

  const safeCategories =
    categories || [];

  const safeSelectedCategory =
    selectedCategory || null;

  const safeOnSelectCategory =
    onSelectCategory ||
    (() => {});

  // =====================================
  // COLLAPSE STATE
  // =====================================

  const [collapsed, setCollapsed] =
    useState(false);

  // =====================================
  // AUTO COLLAPSE ON SCROLL
  // =====================================

  useEffect(() => {

    const handleScroll = () => {

      setCollapsed(
        window.scrollY > 100
      );

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  // =====================================
  // CATEGORY CLICK
  // =====================================

  function handleCategoryClick(
    category: string | null
  ) {

    safeOnSelectCategory(
      category
    );

    setTimeout(() => {

      const productsSection =
        document.getElementById(
          "products"
        );

      productsSection?.scrollIntoView({
        behavior: "smooth",
      });

    }, 100);

  }

  return (

    <aside
      className="
        hidden
        lg:block
        fixed
        top-[80px]
        left-0
        w-full
        z-[41]
        pointer-events-none
      "
    >

      <div
        className="
          container-page
          relative
          pointer-events-auto
        "
      >

        <div className="absolute left-7 w-64">

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-black
              shadow-xl
            "
          >

            {/* ===================================== */}
            {/* HEADER */}
            {/* ===================================== */}

            <button
              type="button"
              onClick={() =>
                setCollapsed(
                  !collapsed
                )
              }
              className="
                flex
                w-full
                items-center
                justify-between
                bg-black
                px-4
                py-4
                text-white
              "
            >

              <span
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                "
              >

                <Menu size={18} />

                კატეგორიები

              </span>

              {collapsed ? (

                <ChevronDown
                  size={20}
                />

              ) : (

                <ChevronUp
                  size={20}
                />

              )}

            </button>

            {/* ===================================== */}
            {/* LIST */}
            {/* ===================================== */}

            <div
              className={`
                grid
                transition-all
                bg-white
                duration-300
                ease-in-out

                ${
                  collapsed
                    ? "grid-rows-[0fr]"
                    : "grid-rows-[1fr]"
                }
              `}
            >

              <div className="overflow-hidden">

                <nav className="flex flex-col">

                  {/* ===================================== */}
                  {/* ALL PRODUCTS */}
                  {/* ===================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryClick(
                        null
                      )
                    }
                    className={`
                      border-b
                      border-gray-200
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-medium
                      transition

                      ${
                        safeSelectedCategory ===
                        null
                          ? "bg-orange-100 text-orange-600"
                          : "text-zinc-800 hover:bg-orange-50 hover:text-orange-500"
                      }
                    `}
                  >

                    სრული პროდუცქია

                  </button>

                  {/* ===================================== */}
                  {/* DYNAMIC CATEGORIES */}
                  {/* ===================================== */}

                  {safeCategories.map(
                    (item) => {

                      const isActive =
                        safeSelectedCategory ===
                        item;

                      return (

                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            handleCategoryClick(
                              item
                            )
                          }
                          className={`
                            border-b
                            border-gray-200
                            px-4
                            py-3
                            text-left
                            text-sm
                            font-medium
                            transition

                            ${
                              isActive
                                ? "bg-orange-100 text-orange-600"
                                : "text-zinc-800 hover:bg-orange-50 hover:text-orange-500"
                            }
                          `}
                        >

                          {item}

                        </button>

                      );

                    }
                  )}

                </nav>

              </div>

            </div>

          </div>

        </div>

      </div>

    </aside>

  );

}