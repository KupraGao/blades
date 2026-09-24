import { Header } from "@/components/layout/Header";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export async function StorefrontHeader() {
  const user = await getAuthUser();

  return (
    <Header
      categories={[]}
      accountHref={user ? "/account" : "/account/login"}
    />
  );
}
