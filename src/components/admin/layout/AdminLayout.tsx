"use client";

import { useState } from "react";

import AdminHeader from "./AdminHeader";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

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
