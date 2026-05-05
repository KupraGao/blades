import { getProducts } from "@/lib/data/products";
import { ProductSectionClient } from "./ProductSectionClient";

export async function ProductSection() {
  const products = await getProducts();

  return <ProductSectionClient products={products} />;
}