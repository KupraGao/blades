import AccountOverview from "@/components/account/AccountOverview";
import { getCustomerOrders } from "@/actions/orders/get-customer-orders";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getAuthorizedAdmin } from "@/lib/auth/get-authorized-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

export default async function AccountPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/account/login");
  }

  const supabase = await createClient();
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  const [profileResult, orders, admin] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle(),
    getCustomerOrders(),
    getAuthorizedAdmin(),
  ]);

  const profile = profileResult.data;

  // profiles = source of truth; Auth user_metadata only if the row is missing.
  const fullName = profile
    ? typeof profile.full_name === "string"
      ? profile.full_name.trim()
      : ""
    : metadataString(metadata, "full_name");

  const phone = profile
    ? typeof profile.phone === "string"
      ? profile.phone.trim()
      : ""
    : metadataString(metadata, "phone");

  return (
    <AccountOverview
      fullName={fullName}
      email={user.email ?? ""}
      phone={phone}
      orders={orders}
      isAdmin={Boolean(admin)}
    />
  );
}
