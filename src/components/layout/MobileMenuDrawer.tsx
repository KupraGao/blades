"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type MobileMenuDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  tab: string;
  setTab: (tab: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export function MobileMenuDrawer({ open, setOpen, tab, setTab, categories, selectedCategory, onSelectCategory }: MobileMenuDrawerProps) {
  const { t } = useLanguage();

  const navItems = [t.home, t.products, t.brands, t.contact];

  function handleCategoryClick(category: string | null) {
    onSelectCategory(category);
    setOpen(false);

    setTimeout(() => {
      const productsSection = document.getElementById("products");
      productsSection?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}

      <div className={`fixed left-0 top-0 z-50 h-full w-80 bg-white text-black transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b p-4">
          <div className="flex gap-2">
            <input type="text" placeholder="ძებნა..." className="flex-1 rounded-lg border px-3 py-2 outline-none" />
            <button aria-label="ძებნა" className="rounded-lg bg-black px-3 text-white">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex border-b">
          <button onClick={() => setTab("categories")} className={`flex-1 py-3 font-bold ${tab === "categories" ? "border-b-2 border-black" : "text-gray-400"}`}>
            {t.categories}
          </button>

          <button onClick={() => setTab("menu")} className={`flex-1 py-3 font-bold ${tab === "menu" ? "border-b-2 border-black" : "text-gray-400"}`}>
            {t.menu}
          </button>
        </div>

        <div className="flex h-[calc(100vh-120px)] flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {tab === "menu" && (
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a key={item} href="#" className="rounded-lg bg-gray-100 px-4 py-2" onClick={() => setOpen(false)}>
                    {item}
                  </a>
                ))}
              </div>
            )}

            {tab === "categories" && (
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => handleCategoryClick(null)} className={`rounded-lg px-4 py-3 text-left ${selectedCategory === null ? "bg-orange-100 text-orange-600" : "bg-gray-100"}`}>
                  {t.allProducts}
                </button>

                {categories.map((category) => (
                  <button key={category} type="button" onClick={() => handleCategoryClick(category)} className={`rounded-lg px-4 py-3 text-left ${selectedCategory === category ? "bg-orange-100 text-orange-600" : "bg-gray-100"}`}>
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}