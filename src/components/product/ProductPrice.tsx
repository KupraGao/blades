import {
  getEffectiveProductPrice,
  getProductDiscountPercent,
  getRegularProductPrice,
  isProductOnSale,
  type ProductPricing,
} from "@/lib/products/pricing";

type ProductPriceProps = {
  product: ProductPricing;
  size?: "card" | "detail" | "compact";
  showPercent?: boolean;
};

export function ProductPrice({
  product,
  size = "card",
  showPercent = true,
}: ProductPriceProps) {
  const onSale = isProductOnSale(product);
  const regularPrice = getRegularProductPrice(product);
  const effectivePrice = getEffectiveProductPrice(product);
  const percent = showPercent ? getProductDiscountPercent(product) : null;

  const effectiveClass =
    size === "detail"
      ? "text-3xl font-black tracking-tight text-brand-gold md:text-4xl"
      : size === "compact"
        ? "font-bold text-brand-gold"
        : "text-base font-black text-brand-gold lg:text-lg";

  const regularClass =
    size === "detail"
      ? "text-lg font-medium text-zinc-400 line-through md:text-xl"
      : "text-sm font-medium text-zinc-400 line-through";

  if (!onSale) {
    return (
      <span className={effectiveClass}>₾{effectivePrice}</span>
    );
  }

  return (
    <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={regularClass}>₾{regularPrice}</span>
      <span className={effectiveClass}>₾{effectivePrice}</span>
      {percent !== null && percent > 0 ? (
        <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-bold leading-none text-brand-orange">
          -{percent}%
        </span>
      ) : null}
    </span>
  );
}
