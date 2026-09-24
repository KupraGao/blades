export type ProductPricing = {
  price: number;
  sale_price?: number | null;
  salePrice?: number | null;
};

function readSalePrice(product: ProductPricing): number | null {
  const raw =
    product.salePrice !== undefined
      ? product.salePrice
      : product.sale_price;

  if (raw === null || raw === undefined) {
    return null;
  }

  const salePrice = Number(raw);
  const regularPrice = Number(product.price);

  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    return null;
  }

  if (!Number.isFinite(regularPrice) || salePrice >= regularPrice) {
    return null;
  }

  return salePrice;
}

export function getRegularProductPrice(product: ProductPricing): number {
  return Number(product.price);
}

export function getEffectiveProductPrice(product: ProductPricing): number {
  return readSalePrice(product) ?? getRegularProductPrice(product);
}

export function isProductOnSale(product: ProductPricing): boolean {
  return readSalePrice(product) !== null;
}

export function getProductDiscountPercent(
  product: ProductPricing,
): number | null {
  const salePrice = readSalePrice(product);

  if (salePrice === null) {
    return null;
  }

  const regularPrice = getRegularProductPrice(product);

  if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
    return null;
  }

  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

export function toProductPricing(
  price: number,
  salePrice: number | null | undefined,
): ProductPricing {
  return {
    price,
    sale_price: salePrice ?? null,
  };
}

export function getCartItemPricing(item: {
  price: number;
  regularPrice?: number | null;
  salePrice?: number | null;
}): ProductPricing {
  return {
    price: item.regularPrice ?? item.price,
    sale_price: item.salePrice ?? null,
  };
}
