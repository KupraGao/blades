import { getBrands } from "@/actions/brands/get-brands";
import { getCategories } from "@/actions/categories/get-categories";
import { getSingleProduct } from "@/actions/products/get-single-product";

import ProductForm from "@/components/admin/products/form/ProductForm";

type Props={
  params:Promise<{
    id:string;
  }>;
};

export default async function EditProductPage({
  params,
}:Props){

  const{id}=await params;

  const product=await getSingleProduct(id);

  if(!product){
    return(
      <h1 className="text-2xl font-bold text-white">
        Product not found
      </h1>
    );
  }

  const brands=await getBrands();

  const categories=await getCategories();

  return(

    <div className="mx-auto max-w-5xl">

      {/* PAGE TOP */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          პროდუქტის რედაქტირება
        </h1>

        <p className="mt-2 text-zinc-400">
          პროდუქტის ინფორმაციის განახლება
        </p>

      </div>

      <ProductForm
        brands={brands}
        categories={categories}
        mode="edit"
        product={product}
      />

    </div>

  );

}