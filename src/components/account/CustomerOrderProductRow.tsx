
"use client";

import Link from "next/link";

import { ProductResponsiveImage } from "@/components/product/ProductResponsiveImage";

type Props = {
  href: string | null;
  imageUrl: string | null;
  confirmedWidths?: unknown;
  sizes?: string;
  title: string;
  quantity: number;
  priceLine?: string | null;
  className?: string;
  imageClassName?: string;
};

export default function CustomerOrderProductRow({
  href,
  imageUrl,
  confirmedWidths,
  sizes = "48px",
  title,
  quantity,
  priceLine = null,
  className = "",
  imageClassName = "h-12 w-12",
}: Props) {
  const image = (
    <ProductResponsiveImage
      src={imageUrl || "/placeholder.png"}
      alt=""
      width={48}
      height={48}
      sizes={sizes}
      confirmedWidths={confirmedWidths}
      className={`${imageClassName} shrink-0 rounded-lg border border-zinc-200 bg-white object-cover dark:border-zinc-700`}
    />
  );

  const titleNode = (
    <p className="break-words text-sm font-semibold text-zinc-900 dark:text-white">
      {title}
    </p>
  );

  return (
    <div className={`flex min-w-0 items-start gap-3 ${className}`.trim()}>
      {href ? (
        <Link
          href={href}
          className="shrink-0 transition hover:opacity-90"
          aria-label={title}
        >
          {image}
        </Link>
      ) : (
        image
      )}

      <div className="min-w-0 pt-0.5">
        {href ? (
          <Link
            href={href}
            className="block transition hover:text-brand-gold dark:hover:text-brand-gold"
          >
            {titleNode}
          </Link>
        ) : (
          titleNode
        )}

        {priceLine ? (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {priceLine}
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            × {quantity}
          </p>
        )}
      </div>
    </div>
  );
}
