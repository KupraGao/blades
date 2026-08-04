import Image from "next/image";
import Link from "next/link";

import { getBrands } from "@/actions/brands/get-brands";
import DeleteBrandButton from "@/app/admin/brands/DeleteBrandButton";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export default async function BrandsPage() {

  const brands: Brand[] = await getBrands();

  return (

    <div>

      {/* TOP */}
      <div className="mb-8 flex items-center justify-between gap-4">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Brands
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your brands
          </p>

        </div>

        <Link
          href="/admin/brands/create"
          className="shrink-0 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Add Brand
        </Link>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">

        {/* HEADER */}
        <div className="grid grid-cols-[1fr_120px] border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400 lg:grid-cols-[80px_1fr_1fr_140px]">

          <div className="hidden lg:block">
            Logo
          </div>

          <div>
            Name
          </div>

          <div className="hidden lg:block">
            Slug
          </div>

          <div className="text-right">
            Actions
          </div>

        </div>

        {/* BODY */}
        {brands.length === 0 ? (

          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

            <p className="text-lg font-semibold text-white">
              No brands found
            </p>
                  
            <p className="mt-2 text-sm text-zinc-500">
              Try changing your search.
            </p>
                  
          </div>
        ) : (

          brands.map((brand) => (

            <div
              key={brand.id}
              className="grid grid-cols-[1fr_120px] items-center border-b border-zinc-800 px-6 py-4 lg:grid-cols-[80px_1fr_1fr_140px]"
            >

              {/* LOGO */}
              <div className="hidden lg:block">

                {brand.logo ? (

                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg object-cover"
                  />

                ) : (

                  <div className="h-14 w-14 rounded-lg bg-zinc-800" />

                )}

              </div>

              {/* NAME */}
              <div className="font-semibold text-white">
                {brand.name}
              </div>

              {/* SLUG */}
              <div className="hidden text-zinc-400 lg:block">
                {brand.slug}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2">

                <Link
                  href={`/admin/brands/edit/${brand.id}`}
                  className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white transition hover:bg-zinc-700"
                >
                  Edit
                </Link>

                <DeleteBrandButton
                  brandId={brand.id}
                />

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

}