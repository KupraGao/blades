"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import AdminLogoutButton from "@/components/admin/auth/AdminLogoutButton";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const linkClass = (href: string) =>
    `rounded-lg px-4 py-3 transition ${
      pathname === href
        ? "bg-zinc-900 text-white"
        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
    }`;

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-zinc-800 bg-black p-6">
      <h1 className="mb-10 text-2xl font-bold text-white">{t.adminPanel}</h1>

      <nav className="flex flex-1 flex-col gap-3">
        <Link href="/admin" className={linkClass("/admin")}>
          {t.dashboard}
        </Link>

        <Link href="/admin/products" className={linkClass("/admin/products")}>
          {t.products}
        </Link>

        <Link href="/admin/brands" className={linkClass("/admin/brands")}>
          {t.brands}
        </Link>

        <Link
          href="/admin/categories"
          className={linkClass("/admin/categories")}
        >
          {t.categories}
        </Link>

        <Link href="/admin/orders" className={linkClass("/admin/orders")}>
          {t.orders}
        </Link>

        <Link href="/admin/users" className={linkClass("/admin/users")}>
          {t.users}
        </Link>

        <Link href="/admin/settings" className={linkClass("/admin/settings")}>
          {t.settings}
        </Link>
      </nav>

      <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4">
        <LanguageSwitcher />
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
