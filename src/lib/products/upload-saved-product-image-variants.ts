import { uploadProductImageVariant } from "@/actions/products/upload-product-image-variant";
import {
  PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES,
  PRODUCT_IMAGE_SOURCE_MAX_BYTES,
} from "@/lib/products/optimize-product-image";
import {
  generateProductImageVariants,
  ProductImageVariantError,
} from "@/lib/products/generate-product-image-variants";
import { planProductImageVariants } from "@/lib/products/plan-product-image-variants";
import { variantHeightFromMaster } from "@/lib/products/product-image-dimensions";
import { readWebpImageInfo } from "@/lib/products/product-image-variant-storage";

/**
 * შენახული Master WebP-იდან ვარიანტების შექმნა და ატვირთვა.
 * პროდუქტის შენახვას არ იძახებს და მის შეცდომას არ აბრუნებს.
 */

export type SavedProductImageSource = {
  id: string;
  imageUrl: string;
};

export type SavedVariantUploadIssue =
  | "FETCH_FAILED"
  | "UNREADABLE"
  | "ENCODE_FAILED"
  | "INVALID_MASTER"
  | "INVALID_VARIANT"
  | "INVALID_INPUT"
  | "IMAGE_NOT_FOUND"
  | "UPLOAD_FAILED"
  | "STORED_UNCONFIRMED"
  | "EXISTING_UNCONFIRMED"
  | "METADATA_FAILED"
  | "WRITES_BLOCKED"
  | "UNAUTHORIZED"
  | "UNKNOWN";

export type SavedVariantProgress = {
  id: string;
  imageId: string;
  imageIndex: number;
  width: number | null;
  state: "working" | "created" | "already-stored" | "skipped" | "error";
  issue?: SavedVariantUploadIssue;
};

const runningProductIds = new Set<string>();

export async function uploadSavedProductImageVariants(
  productId: string,
  images: readonly SavedProductImageSource[],
  onProgress: (update: SavedVariantProgress) => void,
): Promise<"started" | "already-running"> {
  if (runningProductIds.has(productId)) {
    return "already-running";
  }

  runningProductIds.add(productId);

  try {
    for (let imageIndex = 0; imageIndex < images.length; imageIndex += 1) {
      await uploadImageVariants(productId, images[imageIndex], imageIndex, onProgress);
    }

    return "started";
  } finally {
    runningProductIds.delete(productId);
  }
}

async function uploadImageVariants(
  productId: string,
  image: SavedProductImageSource,
  imageIndex: number,
  onProgress: (update: SavedVariantProgress) => void,
) {
  const sourceId = progressId(image.id, null);

  onProgress({
    id: sourceId,
    imageId: image.id,
    imageIndex,
    width: null,
    state: "working",
  });

  let masterBytes: Uint8Array;

  try {
    masterBytes = await readMasterBytes(image.imageUrl);
  } catch (error) {
    onProgress({
      id: sourceId,
      imageId: image.id,
      imageIndex,
      width: null,
      state: "error",
      issue: error instanceof Error && error.message === "FETCH_FAILED"
        ? "FETCH_FAILED"
        : "UNREADABLE",
    });
    return;
  }

  const master = readWebpImageInfo(masterBytes);

  if (!master) {
    onProgress({
      id: sourceId,
      imageId: image.id,
      imageIndex,
      width: null,
      state: "error",
      issue: "INVALID_MASTER",
    });
    return;
  }

  const plannedWidths = planProductImageVariants(master.width, master.height).create;

  if (plannedWidths.length === 0) {
    onProgress({
      id: sourceId,
      imageId: image.id,
      imageIndex,
      width: null,
      state: "skipped",
    });
    return;
  }

  let generated;

  try {
    generated = await generateProductImageVariants(
      webpFile(masterBytes, "master.webp"),
    );
  } catch (error) {
    onProgress({
      id: sourceId,
      imageId: image.id,
      imageIndex,
      width: null,
      state: "error",
      issue: error instanceof ProductImageVariantError ? error.code : "UNREADABLE",
    });
    return;
  }

  for (const width of plannedWidths) {
    const rowId = progressId(image.id, width);

    onProgress({
      id: rowId,
      imageId: image.id,
      imageIndex,
      width,
      state: "working",
    });

    const variant = generated.find((item) => item.width === width);
    const variantBytes = variant
      ? new Uint8Array(await variant.file.arrayBuffer())
      : null;

    if (
      !variant ||
      !variantBytes ||
      !acceptedPlannedVariant(master.width, master.height, width, variantBytes)
    ) {
      onProgress({
        id: rowId,
        imageId: image.id,
        imageIndex,
        width,
        state: "error",
        issue: "INVALID_VARIANT",
      });
      continue;
    }

    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("imageId", image.id);
    formData.set("variantWidth", String(width));
    formData.set("file", webpFile(variantBytes, variant.file.name));

    try {
      const result = await uploadProductImageVariant(formData);

      if (!result.ok) {
        onProgress({
          id: rowId,
          imageId: image.id,
          imageIndex,
          width,
          state: "error",
          issue: result.code,
        });
        continue;
      }

      onProgress({
        id: rowId,
        imageId: image.id,
        imageIndex,
        width,
        state: result.value.outcome,
      });
    } catch (error) {
      onProgress({
        id: rowId,
        imageId: image.id,
        imageIndex,
        width,
        state: "error",
        issue: issueFromUploadError(error),
      });
    }
  }
}

async function readMasterBytes(imageUrl: string): Promise<Uint8Array> {
  let response: Response;

  try {
    response = await fetch(imageUrl, { cache: "no-store" });
  } catch {
    throw new Error("FETCH_FAILED");
  }

  if (!response.ok) {
    throw new Error("FETCH_FAILED");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.byteLength <= 0 || bytes.byteLength > PRODUCT_IMAGE_SOURCE_MAX_BYTES) {
    throw new Error("UNREADABLE");
  }

  return bytes;
}

function acceptedPlannedVariant(
  masterWidth: number,
  masterHeight: number,
  variantWidth: number,
  bytes: Uint8Array,
): boolean {
  const info = readWebpImageInfo(bytes);

  return Boolean(
    info &&
      info.width === variantWidth &&
      info.height === variantHeightFromMaster(masterWidth, masterHeight, variantWidth) &&
      bytes.byteLength > 0 &&
      bytes.byteLength <= PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES,
  );
}

function issueFromUploadError(error: unknown): SavedVariantUploadIssue {
  const message = error instanceof Error ? error.message : "";

  switch (message) {
    case "INVALID_INPUT":
    case "IMAGE_NOT_FOUND":
    case "INVALID_MASTER":
    case "INVALID_VARIANT":
    case "UPLOAD_FAILED":
    case "METADATA_FAILED":
    case "WRITES_BLOCKED":
    case "STORED_UNCONFIRMED":
    case "EXISTING_UNCONFIRMED":
      return message;
    case "Unauthorized":
      return "UNAUTHORIZED";
    default:
      return "UNKNOWN";
  }
}

function progressId(imageId: string, width: number | null) {
  return width == null ? `${imageId}:source` : `${imageId}:${width}`;
}

function webpFile(bytes: Uint8Array, name: string) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return new File([copy], name, { type: "image/webp" });
}
