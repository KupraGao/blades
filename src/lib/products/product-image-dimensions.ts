export const PRODUCT_IMAGE_MASTER_MAX_EDGE = 2048;

const MASTER_MAX_EDGE = PRODUCT_IMAGE_MASTER_MAX_EDGE;

export const PRODUCT_IMAGE_VARIANT_WIDTHS = [128, 384, 768, 1280] as const;

export type ProductImagePixelSize = {
  width: number;
  height: number;
};

export function masterImageSize(
  width: number,
  height: number,
): ProductImagePixelSize {
  const longEdge = Math.max(width, height);

  if (longEdge <= MASTER_MAX_EDGE) {
    return { width, height };
  }

  const scale = MASTER_MAX_EDGE / longEdge;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function variantHeightFromMaster(
  masterWidth: number,
  masterHeight: number,
  variantWidth: number,
): number {
  return Math.max(1, Math.round((masterHeight * variantWidth) / masterWidth));
}

export function productImageVariantLayout(
  width: number,
  height: number,
): ProductImagePixelSize[] {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return [];
  }

  const master = masterImageSize(width, height);
  const variants: ProductImagePixelSize[] = [];

  for (const variantWidth of PRODUCT_IMAGE_VARIANT_WIDTHS) {
    if (variantWidth >= master.width) {
      continue;
    }

    const variantHeight = variantHeightFromMaster(
      master.width,
      master.height,
      variantWidth,
    );

    if (variantHeight > master.height || variantHeight > MASTER_MAX_EDGE) {
      continue;
    }

    variants.push({
      width: variantWidth,
      height: variantHeight,
    });
  }

  return variants;
}
