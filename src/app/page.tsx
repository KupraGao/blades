import { HomeClient } from "@/components/HomeClient";

import { getProducts } from "@/actions/products/get-products";

export default async function Home() {

  // =====================================
  // FETCH PRODUCTS
  // =====================================

  const products =
    await getProducts();

  return (

    <HomeClient
      products={products}
    />

  );

}