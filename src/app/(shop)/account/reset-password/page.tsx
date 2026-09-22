import { redirect } from "next/navigation";

import ResetPasswordForm from "@/components/account/ResetPasswordForm";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export default async function AccountResetPasswordPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/account/forgot-password?error=recovery");
  }

  return (
    <main className="flex min-h-[70vh] items-center px-4 py-10 sm:px-6">
      <ResetPasswordForm />
    </main>
  );
}
