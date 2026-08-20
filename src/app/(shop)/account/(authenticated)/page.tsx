import AccountOverview from "@/components/account/AccountOverview";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/account/login");
  }

  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name.trim()
      : "";
  const phone =
    typeof metadata.phone === "string" ? metadata.phone.trim() : "";

  return (
    <main className="min-h-[70vh] px-4 py-10 sm:px-6">
      <AccountOverview
        fullName={fullName}
        email={user.email ?? ""}
        phone={phone}
      />
    </main>
  );
}
