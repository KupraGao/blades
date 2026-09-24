export const PRODUCT_IMAGE_UPLOAD_FAILED = "PRODUCT_IMAGE_UPLOAD_FAILED";

export function productImageStorageFileName() {
  return `${crypto.randomUUID()}-product-image.webp`;
}
