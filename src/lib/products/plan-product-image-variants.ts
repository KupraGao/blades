/**
 * პროდუქტის სურათის Responsive WebP ვარიანტების დაგეგმვა.
 *
 * ფუნქცია არ ქმნის ფაილებს და არ უკავშირდება Storage-ს.
 * ზომები ემთხვევა master-ის რეალურ 2048px დამრგვალებას.
 */

import {
  PRODUCT_IMAGE_VARIANT_WIDTHS,
  productImageVariantLayout,
} from "./product-image-dimensions";

export type ProductImageVariantPlan = {
  create: number[];
  skip: number[];
};

export function planProductImageVariants(
  width: number,
  height: number,
): ProductImageVariantPlan {
  const create = productImageVariantLayout(width, height).map(
    (variant) => variant.width,
  );

  return {
    create,
    skip: PRODUCT_IMAGE_VARIANT_WIDTHS.filter(
      (variantWidth) => !create.includes(variantWidth),
    ),
  };
}
