"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function OrdersPagination({
  currentPage,
  totalPages,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.previous}
        </button>

        {pages.map((page) => {
          const showTablet = page >= currentPage - 2 && page <= currentPage + 2;
          const showMobile = page >= currentPage - 1 && page <= currentPage + 1;

          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={[
                page === currentPage
                  ? "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                  : "rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white",
                !showTablet ? "hidden md:inline-flex" : "",
                !showMobile ? "hidden sm:inline-flex" : "",
              ].join(" ")}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}
