"use client";

import { Check } from "lucide-react";

import { CatalogFilterSection } from "@/components/product/CatalogFilterSection";
import { useLanguage } from "@/context/LanguageContext";
import type { CatalogCategory } from "@/lib/catalog/catalog-search-params";

type Props = {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  rowClassName: (isActive: boolean) => string;
};

export function CatalogCategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  rowClassName,
}: Props) {
  const { t, language } = useLanguage();

  const selectedCategory = categories.find(
    (category) => String(category.id) === selectedCategoryId,
  );
  const summaryLabel = selectedCategory
    ? language === "ka"
      ? selectedCategory.name_ka
      : selectedCategory.name_en
    : t.allProducts;

  return (
    <CatalogFilterSection
      title={t.catalogFilterCategory}
      summary={summaryLabel}
      defaultOpen
    >
      <nav className="flex flex-col gap-0.5" aria-label={t.catalogFilterCategory}>
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          aria-current={!selectedCategoryId ? "true" : undefined}
          className={rowClassName(!selectedCategoryId)}
        >
          <span className="min-w-0 truncate">{t.allProducts}</span>
          {!selectedCategoryId ? (
            <Check
              size={14}
              className="shrink-0 text-orange-600"
              aria-hidden
            />
          ) : null}
        </button>

        {categories.map((item) => {
          const id = String(item.id);
          const isActive = selectedCategoryId === id;
          const label = language === "ka" ? item.name_ka : item.name_en;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onCategoryChange(id)}
              aria-current={isActive ? "true" : undefined}
              className={rowClassName(isActive)}
            >
              <span className="min-w-0 truncate">{label}</span>
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
