"use client";

import {
  Search,
} from "lucide-react";

const navItems = [
  "მთავარი",
  "კატალოგი",
  "ბრენდები",
  "ფასდაკლება",
  "კონტაქტი",
];

export function MobileMenuDrawer({
  open,
  setOpen,
  tab,
  setTab,
  categories,
  selectedCategory,
  onSelectCategory,
}: any) {

  // =====================================
  // SAFE CATEGORIES
  // =====================================

  const safeCategories =
    Array.isArray(categories)
      ? categories
      : [];

  // =====================================
  // CATEGORY CLICK
  // =====================================

  function handleCategoryClick(
    category: string | null
  ) {

    // FILTER

    onSelectCategory(category);

    // CLOSE DRAWER

    setOpen(false);

    // SCROLL TO PRODUCTS

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

    <>

      {/* ===================================== */}
      {/* OVERLAY */}
      {/* ===================================== */}

      {open && (

        <div
          className="
            fixed inset-0 z-40
            bg-black/60
          "
          onClick={() => setOpen(false)}
        />

      )}

      {/* ===================================== */}
      {/* SIDEBAR */}
      {/* ===================================== */}

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

        {/* ===================================== */}
        {/* SEARCH */}
        {/* ===================================== */}

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

        {/* ===================================== */}
        {/* TABS */}
        {/* ===================================== */}

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
            onClick={() =>
              setTab("categories")
            }
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

        {/* ===================================== */}
        {/* CONTENT */}
        {/* ===================================== */}

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

            {/* ===================================== */}
            {/* MENU */}
            {/* ===================================== */}

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
                    onClick={() =>
                      setOpen(false)
                    }
                  >

                    {item}

                  </a>

                ))}

              </div>

            )}

            {/* ===================================== */}
            {/* CATEGORIES */}
            {/* ===================================== */}

            {tab === "categories" && (

              <div
                className="
                  flex flex-col
                  gap-1 sm:gap-2
                "
              >

                {/* ALL */}

                <button
                  type="button"
                  onClick={() =>
                    handleCategoryClick(
                      null
                    )
                  }
                  className={`
                    rounded-lg
                    px-4 py-2
                    text-left
                    transition

                    ${
                      selectedCategory ===
                      null
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100"
                    }
                  `}
                >

                  ყველა

                </button>

                {/* DYNAMIC CATEGORIES */}

                {safeCategories.map(
                  (item: string) => {

                    const isActive =
                      selectedCategory ===
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
                          rounded-lg
                          px-4 py-2
                          text-left
                          transition

                          ${
                            isActive
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100"
                          }
                        `}
                      >

                        {item}

                      </button>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </>

  );

}