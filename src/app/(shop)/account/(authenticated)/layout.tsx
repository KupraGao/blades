import { redirect } from "next/navigation";

import { AccountStorefrontHeader } from "@/components/account/AccountStorefrontHeader";
import { getAuthUser } from "@/lib/auth/get-auth-user";

// =================================================
// CUSTOMER ACCOUNT GATE (Auth session only)
// =================================================
// Not Admin authorization. Customers do not need admin_users.
// Shared content shell: max-w-5xl + horizontal padding for all
// authenticated account pages (/account, /account/orders/[id]).
// =================================================

export default async function AuthenticatedAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/account/login");
  }

  return (
    <>
      <AccountStorefrontHeader />
      <main className="min-h-[70vh] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </>
  );
}
