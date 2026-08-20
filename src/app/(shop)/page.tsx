import { HomeClient } from "@/components/home/HomeClient";

import { getProducts } from "@/actions/products/get-products";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export default async function Home() {
  const [
    {
      products,
    },
    user,
  ] = await Promise.all([
    getProducts({
      page: 1,
      limit: 12,
    }),
    getAuthUser(),
  ]);

  return (
    <HomeClient
      products={products}
      accountHref={user ? "/account" : "/account/login"}
    />
  );
}