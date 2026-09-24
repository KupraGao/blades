import { StorefrontHeader } from "@/components/layout/StorefrontHeader";

export default function InfoPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StorefrontHeader />
      <main className="section-pad">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">{children}</div>
        </div>
      </main>
    </>
  );
}
