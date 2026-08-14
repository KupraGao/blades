"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/admin/auth/AdminLogoutButton";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const linkClass = (href: string) =>
    `rounded-lg px-4 py-3 transition ${
      pathname === href
        ? "bg-zinc-900 text-white"
        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
    }`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-zinc-800 bg-black p-6 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{t.adminPanel}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 p-2 text-white transition hover:bg-zinc-900"
            aria-label={t.closeMenu}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-3">
          <Link href="/admin" className={linkClass("/admin")} onClick={onClose}>
            {t.dashboard}
          </Link>

          <Link
            href="/admin/products"
            className={linkClass("/admin/products")}
            onClick={onClose}
          >
            {t.products}
          </Link>

          <Link
            href="/admin/brands"
            className={linkClass("/admin/brands")}
            onClick={onClose}
          >
            {t.brands}
          </Link>

          <Link
            href="/admin/categories"
            className={linkClass("/admin/categories")}
            onClick={onClose}
          >
            {t.categories}
          </Link>

          <Link
            href="/admin/orders"
            className={linkClass("/admin/orders")}
            onClick={onClose}
          >
            {t.orders}
          </Link>

          <Link
            href="/admin/users"
            className={linkClass("/admin/users")}
            onClick={onClose}
          >
            {t.users}
          </Link>

          <Link
            href="/admin/settings"
            className={linkClass("/admin/settings")}
            onClick={onClose}
          >
            {t.settings}
          </Link>
        </nav>

        <div className="mt-auto border-t border-zinc-800 pt-4">
          <AdminLogoutButton onAfterClick={onClose} />
        </div>
      </aside>
    </>
  );
}
