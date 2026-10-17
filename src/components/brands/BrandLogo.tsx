import { isStoredBrandLogo } from "@/lib/brands/brand-logo-storage";

type Props = {
  name: string;
  logo: string | null;
  className?: string;
  imgClassName?: string;
  initialClassName?: string;
};

/**
 * Stored brand-logos object, or the first-letter placeholder.
 * External logo URLs are not rendered.
 */
export function BrandLogo({
  name,
  logo,
  className = "",
  imgClassName = "h-full w-full object-contain p-3",
  initialClassName = "text-2xl font-bold text-zinc-400 dark:text-zinc-500",
}: Props) {
  const trimmedLogo = typeof logo === "string" ? logo.trim() : "";
  const hasLogo = isStoredBrandLogo(trimmedLogo);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-white/[0.04] ${className}`}
    >
      {hasLogo ? (
        // eslint-disable-next-line @next/next/no-img-element -- existing storefront logo sizing
        <img
          src={trimmedLogo}
          alt={`${name} logo`}
          className={imgClassName}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className={initialClassName} aria-hidden>
          {initial}
        </span>
      )}
    </div>
  );
}
