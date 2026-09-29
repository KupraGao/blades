"use client";

import { Check } from "lucide-react";

import { CatalogFilterSection } from "@/components/product/CatalogFilterSection";
import { useLanguage } from "@/context/LanguageContext";
import type { CatalogBrandOption } from "@/lib/catalog/catalog-search-params";

type Props = {
  brands: CatalogBrandOption[];
  selectedBrandSlug: string | null;
  onBrandChange: (slug: string | null) => void;
  rowClassName: (isActive: boolean) => string;
};

export function CatalogBrandFilter({
  brands,
  selectedBrandSlug,
  onBrandChange,
  rowClassName,
}: Props) {
  const { t } = useLanguage();

  const selectedBrand = brands.find((brand) => brand.slug === selectedBrandSlug);
  const summaryLabel = selectedBrand?.name ?? t.allBrands;

  return (
    <CatalogFilterSection
      title={t.catalogFilterBrand}
      summary={summaryLabel}
      defaultOpen={false}
      showTopBorder
    >
      <nav className="flex flex-col gap-0.5" aria-label={t.catalogFilterBrand}>
        <button
          type="button"
          onClick={() => onBrandChange(null)}
          aria-current={!selectedBrandSlug ? "true" : undefined}
          className={rowClassName(!selectedBrandSlug)}
        >
          <span className="min-w-0 truncate">{t.allBrands}</span>
          {!selectedBrandSlug ? (
            <Check
              size={14}
              className="shrink-0 text-orange-600"
              aria-hidden
            />
          ) : null}
        </button>

        {brands.map((brand) => {
          const isActive = selectedBrandSlug === brand.slug;

          return (
            <button
              key={brand.slug}
              type="button"
              onClick={() => onBrandChange(brand.slug)}
              aria-current={isActive ? "true" : undefined}
              className={rowClassName(isActive)}
            >
              <span className="min-w-0 truncate">{brand.name}</span>
              {isActive ? (
                <Check
                  size={14}
                  className="shrink-0 text-orange-600"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </nav>
    </CatalogFilterSection>
  );
}
