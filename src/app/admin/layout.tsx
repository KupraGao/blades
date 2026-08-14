// =================================================
// ROOT /admin LAYOUT
// =================================================
// Passthrough only. Authorization + Admin chrome live in
// (protected)/layout.tsx. /admin/login stays outside that gate.
// =================================================

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
