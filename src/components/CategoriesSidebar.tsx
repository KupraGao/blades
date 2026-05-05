"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";

const categories = [
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
];

export function CategoriesSidebar({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // 🔥 სქროლზე იკეცება
  useEffect(() => {
    const handleScroll = () => {
      setCollapsed(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside className="hidden lg:block fixed top-[80px] left-0 w-full z-[41] pointer-events-none">
      <div className="container-page relative pointer-events-auto">
        <div className="absolute left-7 w-64">
          <div className="rounded-2xl border border-black shadow-xl overflow-hidden">

            {/* HEADER */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-between bg-black px-4 py-4 text-white"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Menu size={18} />
                კატეგორიები
              </span>

              {collapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>

            {/* LIST */}
            <div
              className={`grid transition-all bg-white duration-300 ease-in-out ${
                collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              }`}
            >
              <div className="overflow-hidden">
                <nav className="flex flex-col">

                  {categories.map((item) => {
                    const isActive =
                      (item === "ყველა დანა" && selectedCategory === null) ||
                      selectedCategory === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          onSelectCategory(
                            item === "ყველა დანა" ? null : item
                          )
                        }
                        className={`border-b border-gray-200 px-4 py-3 text-left text-sm font-medium transition 
                        ${
                          isActive
                            ? "bg-orange-100 text-orange-600"
                            : "text-zinc-800 hover:bg-orange-50 hover:text-orange-500"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                </nav>
              </div>
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
}