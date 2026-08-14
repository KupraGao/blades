import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getSingleProduct } from "@/actions/products/get-single-product";

import ProductForm from "@/components/admin/products/form/ProductForm";
import ProductFormPageHeader from "@/components/admin/products/form/ProductFormPageHeader";
import ProductNotFound from "@/components/admin/products/form/ProductNotFound";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await getSingleProduct(id);

  if (!product) {
    return <ProductNotFound />;
  }

  const brands = await getBrands();

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-5xl">
      <ProductFormPageHeader mode="edit" />

      <ProductForm
        brands={brands}
        categories={categories}
        mode="edit"
        product={product}
      />
    </div>
  );
}
