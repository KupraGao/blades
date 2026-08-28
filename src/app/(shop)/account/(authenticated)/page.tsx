import AccountOverview from "@/components/account/AccountOverview";
import { getCustomerOrders } from "@/actions/orders/get-customer-orders";
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

  const orders = await getCustomerOrders();

  return (
    <AccountOverview
      fullName={fullName}
      email={user.email ?? ""}
      phone={phone}
      orders={orders}
    />
  );
}
