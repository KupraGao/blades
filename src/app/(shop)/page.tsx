import { HomeClient } from "@/components/home/HomeClient";

import { getProducts } from "@/actions/products/get-products";

export default async function Home() {
  const {
    products,
  } = await getProducts({
    page: 1,
    limit: 12,
  });

  return (
    <HomeClient
      products={products}
    />
  );
}