import { redirect } from "next/navigation";

import CustomerLoginForm from "@/components/account/CustomerLoginForm";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { safeNextPath } from "@/lib/auth/safe-next-path";

type Props = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AccountLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  const user = await getAuthUser();

  if (user) {
    redirect(nextPath);
  }

  const initialErrorKey =
    params.error === "confirm" ? "accountAuthConfirmLinkFailed" : null;

  return (
    <main className="flex min-h-[70vh] items-center px-4 py-10 sm:px-6">
      <CustomerLoginForm
        initialErrorKey={initialErrorKey}
        nextPath={nextPath}
      />
    </main>
  );
}
