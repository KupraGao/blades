import { redirect } from "next/navigation";

import CustomerRegisterForm from "@/components/account/CustomerRegisterForm";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export default async function AccountRegisterPage() {
  const user = await getAuthUser();

  if (user) {
    redirect("/account");
  }

  return (
    <main className="flex min-h-[70vh] items-center px-4 py-10 sm:px-6">
      <CustomerRegisterForm />
    </main>
  );
}
