"use client";

import Link from "next/link";

import ProductSearch from "./ProductSearch";

export default function ProductToolbar(){

  return(

    <div className="flex items-center justify-between gap-4">

      <ProductSearch />

      <Link
        href="/admin/products/create"
        className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
      >
        + Add Product
      </Link>

    </div>

  );

}