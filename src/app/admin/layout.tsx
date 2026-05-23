import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-zinc-950">

      <div className="flex">

        <Sidebar />

        <section className="flex-1 p-10">
          {children}
        </section>

      </div>

    </main>
  );
}