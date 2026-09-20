"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getCatalogPageItems } from "@/lib/catalog/catalog-search-params";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  currentPage: number;
  totalPages: number;
};

export function CatalogPagination({ currentPage, totalPages }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page: number) {
    const next = Math.min(Math.max(page, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());

    if (next <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(next));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  }

  const items = getCatalogPageItems(currentPage, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label={t.catalogPaginationLabel}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-brand-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200"
      >
        {t.previous}
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-zinc-500"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => goToPage(item)}
            className={
              item === currentPage
                ? "rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-black"
                : "rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-brand-gold dark:border-white/15 dark:bg-white/5 dark:text-zinc-200"
            }
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-brand-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200"
      >
        {t.next}
      </button>
    </nav>
  );
}
