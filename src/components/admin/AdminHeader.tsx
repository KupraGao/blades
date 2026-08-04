"use client";

import { Menu } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-black px-4 py-4 lg:hidden">
      <h1 className="text-xl font-bold text-white">Admin Panel</h1>

      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg border border-zinc-800 p-2 text-white transition hover:bg-zinc-900"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
    </header>
  );
}
