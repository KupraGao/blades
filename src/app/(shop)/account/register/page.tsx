import { redirect } from "next/navigation";

import CustomerRegisterForm from "@/components/account/CustomerRegisterForm";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { safeNextPath } from "@/lib/auth/safe-next-path";

type Props = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AccountRegisterPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  const user = await getAuthUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-[70vh] items-center px-4 py-10 sm:px-6">
      <CustomerRegisterForm nextPath={nextPath} />
    </main>
  );
}
