"use client";

import { Menu } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: Props) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-800 bg-black px-4 py-4 lg:hidden">
      <h1 className="min-w-0 truncate text-xl font-bold text-white">
        {t.adminPanel}
      </h1>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />

        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-zinc-800 p-2 text-white transition hover:bg-zinc-900"
          aria-label={t.openMenu}
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}
