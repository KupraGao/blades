"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import AdminHeader from "./AdminHeader";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Login uses a standalone chrome-free shell (still under /admin layout).
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <AdminHeader onMenuClick={() => setIsOpen(true)} />

      <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <section className="flex-1 p-4 md:p-6 lg:p-10">{children}</section>
      </div>
    </main>
  );
}
