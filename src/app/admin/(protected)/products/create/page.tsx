import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";

import ProductForm from "@/components/admin/products/form/ProductForm";

/* PAGE */
export default async function CreateProductPage() {
  const brands = await getBrands();

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-5xl">
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}
