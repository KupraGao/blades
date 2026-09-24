export const PRODUCT_IMAGE_SOURCE_MAX_BYTES = 20 * 1024 * 1024;
export const PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES = 2 * 1024 * 1024;
export const PRODUCT_IMAGE_COMBINED_OPTIMIZED_MAX_BYTES = 8 * 1024 * 1024;

const MAX_LONG_EDGE = 2048;
const WEBP_QUALITY = 0.84;
const WEBP_FALLBACK_QUALITY = 0.78;

export type ProductImageOptimizeErrorCode =
  | "SOURCE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "OPTIMIZE_FAILED"
  | "OUTPUT_TOO_LARGE"
  | "COMBINED_TOO_LARGE";

export class ProductImageOptimizeError extends Error {
  readonly code: ProductImageOptimizeErrorCode;

  constructor(code: ProductImageOptimizeErrorCode) {
    super(code);
    this.name = "ProductImageOptimizeError";
    this.code = code;
  }
}

type DecodedSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export async function optimizeProductImage(file: File): Promise<File> {
  if (file.size > PRODUCT_IMAGE_SOURCE_MAX_BYTES) {
    throw new ProductImageOptimizeError("SOURCE_TOO_LARGE");
  }

  let decoded: DecodedSource;

  try {
    decoded = await decodeSourceImage(file);
  } catch (error) {
    if (error instanceof ProductImageOptimizeError) {
      throw error;
    }

    throw new ProductImageOptimizeError("UNSUPPORTED_FORMAT");
  }

  try {
    if (!decoded.width || !decoded.height) {
      throw new ProductImageOptimizeError("UNSUPPORTED_FORMAT");
    }

    const { width, height } = scaledSize(decoded.width, decoded.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      throw new ProductImageOptimizeError("OPTIMIZE_FAILED");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, width, height);

    let blob = await canvasToWebpBlob(canvas, WEBP_QUALITY);

    if (blob.size > PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES) {
      blob = await canvasToWebpBlob(canvas, WEBP_FALLBACK_QUALITY);
    }

    if (blob.size > PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES) {
      throw new ProductImageOptimizeError("OUTPUT_TOO_LARGE");
    }

    return new File([blob], toWebpFileName(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    if (error instanceof ProductImageOptimizeError) {
      throw error;
    }

    throw new ProductImageOptimizeError("OPTIMIZE_FAILED");
  } finally {
    decoded.close();
  }
}

function scaledSize(width: number, height: number) {
  const longEdge = Math.max(width, height);

  if (longEdge <= MAX_LONG_EDGE) {
    return { width, height };
  }

  const scale = MAX_LONG_EDGE / longEdge;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function toWebpFileName(originalName: string) {
  const trimmed = originalName.trim();
  const lastDot = trimmed.lastIndexOf(".");
  const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const safeBase = base.replace(/[/\\]/g, "").trim() || "image";

  return `${safeBase}.webp`;
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
        // Fall through to HTMLImageElement decoding.
      }
    }
  }

  return decodeWithHtmlImage(file);
}

function fromImageBitmap(bitmap: ImageBitmap): DecodedSource {
  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    close: () => bitmap.close(),
  };
}

function decodeWithHtmlImage(file: File): Promise<DecodedSource> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        URL.revokeObjectURL(objectUrl);
        reject(new ProductImageOptimizeError("UNSUPPORTED_FORMAT"));
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
      reject(new ProductImageOptimizeError("UNSUPPORTED_FORMAT"));
    };

    image.src = objectUrl;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || (blob.type && blob.type !== "image/webp")) {
          reject(new ProductImageOptimizeError("OPTIMIZE_FAILED"));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}
