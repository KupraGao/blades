import { HomeClient } from "@/components/HomeClient";

import { getProducts } from "@/actions/products/get-products";

export default async function Home() {

  const products =
    await getProducts();

  return (

    <HomeClient
      products={products}
    />

  );

}