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

export function CategoriesSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // 🔥 პატარა სქროლზეც იკეცება
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside className="hidden lg:block fixed top-[80px] left-0 w-full z-[41] pointer-events-none">

      {/* container alignment */}
      <div className="container-page relative pointer-events-auto">

        {/* 🔥 LEFT ALIGN FIX (ემთხვევა ლოგოს padding-ს) */}
        <div className="absolute left-7 w-64">

          <div className="rounded-2xl border border-black shadow-xl overflow-hidden">

            {/* HEADER */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-between bg-black px-4 py-4 text-white"
            >
              <span className="flex items-center  gap-2 text-sm font-bold">
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
              className={`grid transition-all  bg-white duration-300 ease-in-out ${
                collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              }`}
            >
              <div className="overflow-hidden">
                <nav className="flex flex-col">

                  {categories.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="border-b border-gray-200 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-orange-50 hover:text-orange-500"
                    >
                      {item}
                    </a>
                  ))}

                </nav>
              </div>
            </div>

          </div>

        </div>
      </div>
    </aside>
  );
}