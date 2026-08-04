"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: Props) {

  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", page.toString());

    router.push(`/admin/products?${params.toString()}`);

  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (

    <div className="mt-8">

      <div className="flex flex-wrap items-center justify-center gap-2">

        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {pages.map((page) => {

          const showDesktop = true;

          const showTablet =
            page >= currentPage - 2 &&
            page <= currentPage + 2;

          const showMobile =
            page >= currentPage - 1 &&
            page <= currentPage + 1;

          return (

            <button
              key={page}
              onClick={() => goToPage(page)}
              className={[
                page === currentPage
                  ? "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                  : "rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white",

                showDesktop
                  ? ""
                  : "",

                !showTablet
                  ? "hidden md:inline-flex"
                  : "",

                !showMobile
                  ? "hidden sm:inline-flex"
                  : "",
              ].join(" ")}
            >
              {page}
            </button>

          );

        })}

        <button
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>

  );

}