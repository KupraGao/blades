"use client";

import { useState } from "react";

import { deleteProductsBulk } from "@/actions/products/delete-products-bulk";
import ChangeCategoriesModal from "@/components/admin/products/list/ChangeCategoriesModal";
import ProductsTable from "@/components/admin/products/list/ProductsTable";

type ProductImage = {
  id: number;
  image_url: string;
  is_main: boolean;
};

type ProductCategory = {
  categories: {
    id: string;
    name_ka: string;
    name_en: string;
  } | null;
};

type Product = {
  id: string;
  title: string;
  knife_type: string | null;
  price: number;
  stock: number;
  product_images: ProductImage[];
  product_categories: ProductCategory[];
};

type Category = {
  id: string;
  name_ka: string;
  name_en: string;
};

type Props = {
  products: Product[];
  categories: Category[];
};

export default function ProductBulkTable({
  products,
  categories,
}: Props) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleProduct(productId: string) {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function toggleAll() {
    setSelectedProducts((prev) =>
      prev.length === products.length
        ? []
        : products.map((product) => product.id),
    );
  }

  function clearSelectedProducts() {
    setSelectedProducts([]);
  }

  async function deleteSelectedProducts() {
    if (selectedProducts.length === 0) {
      return;
    }

    try {
      setLoading(true);

      await deleteProductsBulk({
        productIds: selectedProducts,
      });

      clearSelectedProducts();

      window.location.reload();

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">

          <span className="text-sm text-zinc-300">
            {selectedProducts.length} selected
          </span>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => setIsCategoriesModalOpen(true)}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Change Categories
            </button>


            <button
              type="button"
              onClick={deleteSelectedProducts}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Selected"}
            </button>

          </div>

        </div>
      )}


      <ProductsTable
        products={products}
        selectedProducts={selectedProducts}
        onToggleProduct={toggleProduct}
        onToggleAll={toggleAll}
      />


      <ChangeCategoriesModal
        open={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        selectedProducts={selectedProducts}
        onSuccess={clearSelectedProducts}
      />

    </>
  );
}