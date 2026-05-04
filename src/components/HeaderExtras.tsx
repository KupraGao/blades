"use client";

import { Search, Phone } from "lucide-react";

export function HeaderExtras() {
  return (
    <div className="hidden lg:block sticky top-20 z-40 bg-black/70 backdrop-blur border-b border-white/10">

      <div className="container-page">

        <div className="ml-[272px] flex items-center gap-6 py-1">

          {/* SEARCH */}
          <div className="flex-1 h-12 flex items-center border border-white/10 bg-white rounded-xl overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="ძებნა..."
              className="flex-1 h-full px-4 outline-none text-sm text-black bg-white"
            />

            <button
              aria-label="ძებნა"
              className="px-4 bg-black text-white h-full flex items-center hover:text-orange-400 transition"
            >
              <Search size={18} />
            </button>
          </div>

          {/* PHONE */}
          <a
            href="tel:+995557910101"
            className="flex items-center gap-3 text-sm text-white whitespace-nowrap"
          >
            <Phone size={18} />

            <div className="leading-tight">
              <p className="text-xs text-zinc-400">24/7 დახმარება</p>

              <p className="text-base font-semibold text-white hover:text-orange-400 transition">
                +995 557 91 01 01
              </p>
            </div>
          </a>

        </div>

      </div>
    </div>
  );
}