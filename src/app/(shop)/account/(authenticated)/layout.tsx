import { redirect } from "next/navigation";

import { AccountStorefrontHeader } from "@/components/account/AccountStorefrontHeader";
import { getAuthUser } from "@/lib/auth/get-auth-user";

// =================================================
// CUSTOMER ACCOUNT GATE (Auth session only)
// =================================================
// Not Admin authorization. Customers do not need admin_users.
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
      {children}
    </>
  );
}
