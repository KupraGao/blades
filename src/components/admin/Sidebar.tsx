import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-[260px] border-r border-zinc-800 bg-black p-6">

      <h1 className="mb-10 text-2xl font-bold text-white">
        Admin Panel
      </h1>

      <nav className="flex flex-col gap-3">

        <Link
          href="/admin"
          className="
            rounded-lg
            bg-zinc-900
            px-4
            py-3
            text-white
            transition
            hover:bg-zinc-800
          "
        >
          Dashboard
        </Link>

        <Link
          href="/admin/products"
          className="
            rounded-lg
            px-4
            py-3
            text-zinc-300
            transition
            hover:bg-zinc-900
            hover:text-white
          "
        >
          Products
        </Link>

        <Link
          href="/admin/categories"
          className="
            rounded-lg
            px-4
            py-3
            text-zinc-300
            transition
            hover:bg-zinc-900
            hover:text-white
          "
        >
          Categories
        </Link>

        <Link
          href="/admin/orders"
          className="
            rounded-lg
            px-4
            py-3
            text-zinc-300
            transition
            hover:bg-zinc-900
            hover:text-white
          "
        >
          Orders
        </Link>

      </nav>

    </aside>
  );
}