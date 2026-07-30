"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-lg px-4 py-3 transition ${
      pathname === href
        ? "bg-zinc-900 text-white"
        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
    }`;

  return (
    <aside className="w-[260px] border-r border-zinc-800 bg-black p-6">

      <h1 className="mb-10 text-2xl font-bold text-white">
        Admin Panel
      </h1>

      <nav className="flex flex-col gap-3">

        <Link
          href="/admin"
          className={linkClass("/admin")}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/products"
          className={linkClass("/admin/products")}
        >
          Products
        </Link>

        <Link
          href="/admin/brands"
          className={linkClass("/admin/brands")}
        >
          Brands
        </Link>

        <Link
          href="/admin/categories"
          className={linkClass("/admin/categories")}
        >
          Categories
        </Link>

        <Link
          href="/admin/orders"
          className={linkClass("/admin/orders")}
        >
          Orders
        </Link>

        <Link
          href="/admin/users"
          className={linkClass("/admin/users")}
        >
          Users
        </Link>

        <Link
          href="/admin/settings"
          className={linkClass("/admin/settings")}
        >
          Settings
        </Link>

      </nav>

    </aside>
  );

}