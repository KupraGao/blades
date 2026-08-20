import { redirect } from "next/navigation";

import CustomerLoginForm from "@/components/account/CustomerLoginForm";
import { getAuthUser } from "@/lib/auth/get-auth-user";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AccountLoginPage({ searchParams }: Props) {
  const user = await getAuthUser();

  if (user) {
    redirect("/account");
  }

  const params = await searchParams;
  const initialErrorKey =
    params.error === "confirm" ? "accountAuthConfirmLinkFailed" : null;

  return (
    <main className="flex min-h-[70vh] items-center px-4 py-10 sm:px-6">
      <CustomerLoginForm initialErrorKey={initialErrorKey} />
    </main>
  );
}
