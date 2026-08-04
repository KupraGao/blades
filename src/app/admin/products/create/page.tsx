import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";

import ProductForm from "@/components/admin/products/form/ProductForm";

/* PAGE */
export default async function CreateProductPage(){

  const brands=await getBrands();

  const categories=await getCategories();

  return(

    <div className="mx-auto max-w-5xl">

      {/* PAGE TOP */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          პროდუქტის დამატება
        </h1>

        <p className="mt-2 text-zinc-400">
          ახალი დანის პროდუქტის შექმნა
        </p>

      </div>

      <ProductForm
        brands={brands}
        categories={categories}
      />

    </div>

  );

}