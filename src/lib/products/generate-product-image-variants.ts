import { productImageVariantLayout } from "@/lib/products/product-image-dimensions";
import { PRODUCT_IMAGE_SOURCE_MAX_BYTES } from "@/lib/products/optimize-product-image";

const WEBP_QUALITY = 0.84;

export type ProductImageVariantFile = {
  width: number;
  height: number;
  file: File;
};

export type ProductImageVariantErrorCode = "UNREADABLE" | "ENCODE_FAILED";

export class ProductImageVariantError extends Error {
  readonly code: ProductImageVariantErrorCode;

  constructor(code: ProductImageVariantErrorCode) {
    super(code);
    this.name = "ProductImageVariantError";
    this.code = code;
  }
}

type DecodedSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export async function generateProductImageVariants(
  file: File,
): Promise<ProductImageVariantFile[]> {
  if (!(file instanceof File) || file.size <= 0 || file.size > PRODUCT_IMAGE_SOURCE_MAX_BYTES) {
    throw new ProductImageVariantError("UNREADABLE");
  }

  let decoded: DecodedSource;

  try {
    decoded = await decodeSourceImage(file);
  } catch (error) {
    if (error instanceof ProductImageVariantError) {
      throw error;
    }

    throw new ProductImageVariantError("UNREADABLE");
  }

  try {
    const variants: ProductImageVariantFile[] = [];

    for (const variant of productImageVariantLayout(decoded.width, decoded.height)) {
      const blob = await encodeWebp(decoded.source, variant.width, variant.height);

      variants.push({
        width: variant.width,
        height: variant.height,
        file: new File([blob], `w${variant.width}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        }),
      });
    }

    return variants;
  } catch (error) {
    if (error instanceof ProductImageVariantError) {
      throw error;
    }

    throw new ProductImageVariantError("ENCODE_FAILED");
  } finally {
    decoded.close();
  }
}

async function decodeSourceImage(file: File): Promise<DecodedSource> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });

      return fromImageBitmap(bitmap);
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        return fromImageBitmap(bitmap);
      } catch {
        // HTMLImageElement decodes formats that createImageBitmap rejects.
      }
    }
  }

  return decodeWithHtmlImage(file);
}

function fromImageBitmap(bitmap: ImageBitmap): DecodedSource {
  if (!bitmap.width || !bitmap.height) {
    bitmap.close();
    throw new ProductImageVariantError("UNREADABLE");
  }

  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    close: () => bitmap.close(),
  };
}

function decodeWithHtmlImage(file: File): Promise<DecodedSource> {
  if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") {
    return Promise.reject(new ProductImageVariantError("UNREADABLE"));
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        URL.revokeObjectURL(objectUrl);
        reject(new ProductImageVariantError("UNREADABLE"));
        return;
      }

      resolve({
        source: image,
        width,
        height,
        close: () => {
          URL.revokeObjectURL(objectUrl);
        },
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ProductImageVariantError("UNREADABLE"));
    };

    image.src = objectUrl;
  });
}

function encodeWebp(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<Blob> {
  if (typeof document === "undefined") {
    return Promise.reject(new ProductImageVariantError("ENCODE_FAILED"));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    return Promise.reject(new ProductImageVariantError("ENCODE_FAILED"));
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || (blob.type && blob.type !== "image/webp")) {
          reject(new ProductImageVariantError("ENCODE_FAILED"));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      WEBP_QUALITY,
    );
  });
}
