import type { SupabaseClient } from "@supabase/supabase-js";

import { PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES } from "@/lib/products/optimize-product-image";
import {
  PRODUCT_IMAGE_MASTER_MAX_EDGE,
  PRODUCT_IMAGE_VARIANT_WIDTHS,
  variantHeightFromMaster,
} from "@/lib/products/product-image-dimensions";

export const PRODUCT_IMAGES_BUCKET = "product-images";

const MASTER_FILE_NAME =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-product-image\.webp$/i;
const ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
const VARIANT_WIDTH_TEXT = new Set(
  PRODUCT_IMAGE_VARIANT_WIDTHS.map((width) => String(width)),
);

export type ProductImageVariantUploadCode =
  | "INVALID_INPUT"
  | "IMAGE_NOT_FOUND"
  | "INVALID_MASTER"
  | "INVALID_VARIANT"
  | "UPLOAD_FAILED"
  | "STORED_UNCONFIRMED"
  | "EXISTING_UNCONFIRMED"
  | "METADATA_FAILED"
  | "WRITES_BLOCKED";

export class ProductImageVariantUploadError extends Error {
  readonly code: ProductImageVariantUploadCode;

  constructor(code: ProductImageVariantUploadCode) {
    super(code);
    this.name = "ProductImageVariantUploadError";
    this.code = code;
  }
}

export type ProductImageVariantUploadInput = {
  productId: string;
  imageId: string;
  variantWidth: number;
  bytes: Uint8Array;
  contentType: string;
};

export type ProductImageVariantUploadSuccess = {
  outcome: "created" | "already-stored";
  bucket: typeof PRODUCT_IMAGES_BUCKET;
  fileName: string;
  width: number;
  height: number;
  bytes: number;
};

export type ProductImageVariantObjectStore = {
  download(fileName: string): Promise<Uint8Array | null>;
  uploadNew(fileName: string, bytes: Uint8Array): Promise<"created" | "conflict" | "failed">;
};

export type ProductImageVariantMetadataWriter = {
  rememberConfirmedWidth(productId: string, imageId: string, width: number): Promise<void>;
};

export type OwnedProductImageLookup = {
  findOwnedImage(productId: string, imageId: string): Promise<string | null>;
};

type StorageUploadError = {
  status?: number;
  statusCode?: string | number;
  message?: string;
};

export function isStorageConflict(error: StorageUploadError): boolean {
  return error.status === 409 || String(error.statusCode) === "409" || error.statusCode === "Duplicate";
}

export function masterFileNameFromImageUrl(imageUrl: string): string | null {
  let pathname: string;

  try {
    pathname = new URL(imageUrl).pathname;
  } catch {
    return null;
  }

  const parts = pathname.split("/").filter((part) => part.length > 0);
  const bucketIndex = parts.lastIndexOf(PRODUCT_IMAGES_BUCKET);

  if (bucketIndex === -1 || bucketIndex !== parts.length - 2) {
    return null;
  }

  const fileName = parts[bucketIndex + 1];

  if (!fileName || fileName.includes("%") || fileName.includes("..")) {
    return null;
  }

  const match = MASTER_FILE_NAME.exec(fileName);

  if (!match) {
    return null;
  }

  return `${match[1]}-product-image.webp`;
}

export function variantFileNameFromMaster(
  masterFileName: string,
  variantWidth: number,
): string | null {
  const match = MASTER_FILE_NAME.exec(masterFileName);

  if (!match || !isVariantWidth(variantWidth)) {
    return null;
  }

  return `${match[1]}-product-image-w${variantWidth}.webp`;
}

export function variantWidthFromObjectName(fileName: string): number | null {
  for (const width of PRODUCT_IMAGE_VARIANT_WIDTHS) {
    if (fileName.endsWith(`-product-image-w${width}.webp`)) {
      return width;
    }
  }

  return null;
}

export type ProductImageVariantCleanupCode =
  | "UNAUTHORIZED"
  | "INVALID_MASTER"
  | "STORAGE_FAILED"
  | "METADATA_FAILED";

export class ProductImageVariantCleanupError extends Error {
  readonly code: ProductImageVariantCleanupCode;

  constructor(code: ProductImageVariantCleanupCode, message: string = code) {
    super(code === "UNAUTHORIZED" ? "Unauthorized" : message);
    this.name = "ProductImageVariantCleanupError";
    this.code = code;
  }
}

export function variantObjectNamesFromMasterUrl(imageUrl: string): string[] | null {
  const masterFileName = masterFileNameFromImageUrl(imageUrl);

  if (!masterFileName) {
    return null;
  }

  const names: string[] = [];

  for (const width of PRODUCT_IMAGE_VARIANT_WIDTHS) {
    const fileName = variantFileNameFromMaster(masterFileName, width);

    if (!fileName || fileName === masterFileName || names.includes(fileName)) {
      return null;
    }

    names.push(fileName);
  }

  if (names.length !== PRODUCT_IMAGE_VARIANT_WIDTHS.length) {
    return null;
  }

  return names;
}

export async function removeExactProductImageVariants(
  authorization: { admin: boolean },
  removeExact: (fileName: string) => Promise<{ error: { message: string } | null }>,
  imageUrl: string,
): Promise<"removed"> {
  if (authorization.admin !== true) {
    throw new ProductImageVariantCleanupError("UNAUTHORIZED");
  }

  const names = variantObjectNamesFromMasterUrl(imageUrl);

  if (!names) {
    throw new ProductImageVariantCleanupError("INVALID_MASTER");
  }

  for (const fileName of names) {
    // ერთი სრული ობიექტის სახელი. საერთო prefix არ იგზავნება.
    const { error } = await removeExact(fileName);

    if (error) {
      const message = error.message.trim();
      throw new ProductImageVariantCleanupError(
        "STORAGE_FAILED",
        message || "STORAGE_FAILED",
      );
    }
  }

  return "removed";
}

export function readWebpImageInfo(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  if (bytes.length < 12 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 12) !== "WEBP") {
    return null;
  }

  const riffSize = readU32LE(bytes, 4);

  if (riffSize < 12 || riffSize + 8 > bytes.length) {
    return null;
  }

  const chunk = ascii(bytes, 12, 16);

  if (chunk === "VP8X" && bytes.length >= 30 && readU32LE(bytes, 16) >= 10) {
    return finiteSize(
      1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
      1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
    );
  }

  if (
    chunk === "VP8 " &&
    bytes.length >= 30 &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    return finiteSize(
      readU16LE(bytes, 26) & 0x3fff,
      readU16LE(bytes, 28) & 0x3fff,
    );
  }

  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const bits = readU32LE(bytes, 21);

    return finiteSize((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1);
  }

  return null;
}

export function variantMatchesMaster(
  masterWidth: number,
  masterHeight: number,
  variantWidth: number,
  variantHeight: number,
): boolean {
  if (
    !isVariantWidth(variantWidth) ||
    !Number.isSafeInteger(masterWidth) ||
    !Number.isSafeInteger(masterHeight) ||
    !Number.isSafeInteger(variantHeight) ||
    masterWidth <= 0 ||
    masterHeight <= 0 ||
    variantWidth >= masterWidth ||
    variantHeight <= 0 ||
    variantHeight > masterHeight ||
    variantWidth > PRODUCT_IMAGE_MASTER_MAX_EDGE ||
    variantHeight > PRODUCT_IMAGE_MASTER_MAX_EDGE
  ) {
    return false;
  }

  return variantHeight === variantHeightFromMaster(masterWidth, masterHeight, variantWidth);
}

export async function readProductImageVariantUpload(
  formData: FormData,
): Promise<ProductImageVariantUploadInput> {
  const productId = formData.get("productId");
  const imageId = formData.get("imageId");
  const variantWidth = formData.get("variantWidth");
  const file = formData.get("file");

  if (
    typeof productId !== "string" ||
    typeof imageId !== "string" ||
    typeof variantWidth !== "string" ||
    !(file instanceof File) ||
    !ID_PATTERN.test(productId) ||
    !ID_PATTERN.test(imageId) ||
    !VARIANT_WIDTH_TEXT.has(variantWidth)
  ) {
    throw new ProductImageVariantUploadError("INVALID_INPUT");
  }

  const contentType = file.type.trim().toLowerCase();

  if (contentType !== "" && contentType !== "image/webp") {
    throw new ProductImageVariantUploadError("INVALID_VARIANT");
  }

  if (file.size <= 0 || file.size > PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES) {
    throw new ProductImageVariantUploadError("INVALID_VARIANT");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes.byteLength !== file.size || !acceptedVariantBytes(bytes, Number(variantWidth))) {
    throw new ProductImageVariantUploadError("INVALID_VARIANT");
  }

  return {
    productId,
    imageId,
    variantWidth: Number(variantWidth),
    bytes,
    contentType,
  };
}

export async function uploadProductImageVariantRecord(
  lookup: OwnedProductImageLookup,
  store: ProductImageVariantObjectStore,
  metadata: ProductImageVariantMetadataWriter,
  input: ProductImageVariantUploadInput,
): Promise<ProductImageVariantUploadSuccess> {
  if (!acceptedVariantBytes(input.bytes, input.variantWidth)) {
    throw new ProductImageVariantUploadError("INVALID_VARIANT");
  }

  const imageUrl = await lookup.findOwnedImage(input.productId, input.imageId);

  if (!imageUrl) {
    throw new ProductImageVariantUploadError("IMAGE_NOT_FOUND");
  }

  const masterFileName = masterFileNameFromImageUrl(imageUrl);
  const variantFileName = masterFileName
    ? variantFileNameFromMaster(masterFileName, input.variantWidth)
    : null;

  if (!masterFileName || !variantFileName || variantFileName === masterFileName) {
    throw new ProductImageVariantUploadError("INVALID_MASTER");
  }

  const masterBytes = await store.download(masterFileName);
  const masterInfo = masterBytes ? readWebpImageInfo(masterBytes) : null;

  if (!masterInfo || !variantMatchesMaster(
    masterInfo.width,
    masterInfo.height,
    input.variantWidth,
    readWebpImageInfo(input.bytes)?.height ?? 0,
  )) {
    throw new ProductImageVariantUploadError(masterInfo ? "INVALID_VARIANT" : "INVALID_MASTER");
  }

  const uploadResult = await store.uploadNew(variantFileName, input.bytes);

  if (uploadResult === "failed") {
    throw new ProductImageVariantUploadError("UPLOAD_FAILED");
  }

  const stored = await store.download(variantFileName);
  const storedIsValid = stored
    ? storedVariantIsValid(stored, masterInfo.width, masterInfo.height, input.variantWidth)
    : false;

  if (!stored || !storedIsValid) {
    throw new ProductImageVariantUploadError(
      uploadResult === "created" ? "STORED_UNCONFIRMED" : "EXISTING_UNCONFIRMED",
    );
  }

  try {
    await metadata.rememberConfirmedWidth(input.productId, input.imageId, input.variantWidth);
  } catch (error) {
    if (error instanceof ProductImageVariantUploadError) {
      throw error;
    }

    throw new ProductImageVariantUploadError("METADATA_FAILED");
  }

  return success(
    uploadResult === "created" ? "created" : "already-stored",
    variantFileName,
    stored,
  );
}

export async function confirmedVariantWidths(
  store: ProductImageVariantObjectStore,
  masterFileName: string,
  masterWidth: number,
  masterHeight: number,
): Promise<number[]> {
  const confirmed: number[] = [];

  for (const variantWidth of PRODUCT_IMAGE_VARIANT_WIDTHS) {
    const fileName = variantFileNameFromMaster(masterFileName, variantWidth);

    if (!fileName) {
      continue;
    }

    const bytes = await store.download(fileName);

    if (bytes && storedVariantIsValid(bytes, masterWidth, masterHeight, variantWidth)) {
      confirmed.push(variantWidth);
    }
  }

  return confirmed;
}

export function createOwnedProductImageLookup(
  supabase: SupabaseClient,
): OwnedProductImageLookup {
  return {
    async findOwnedImage(productId, imageId) {
      const { data, error } = await supabase
        .from("product_images")
        .select("image_url, product_id")
        .eq("id", imageId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error || !data?.image_url || String(data.product_id) !== productId) {
        return null;
      }

      return data.image_url;
    },
  };
}

export function createProductImageVariantStore(
  supabase: SupabaseClient,
): ProductImageVariantObjectStore {
  return {
    async download(fileName) {
      try {
        const { data, error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .download(fileName);

        if (error || !data) {
          return null;
        }

        return new Uint8Array(await data.arrayBuffer());
      } catch {
        return null;
      }
    },

    async uploadNew(fileName, bytes) {
      try {
        const copy = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(copy).set(bytes);
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(fileName, new Blob([copy], { type: "image/webp" }), {
            contentType: "image/webp",
            upsert: false,
          });

        if (!error) {
          return "created";
        }

        return isStorageConflict(error) ? "conflict" : "failed";
      } catch {
        return "failed";
      }
    },
  };
}

function success(
  outcome: ProductImageVariantUploadSuccess["outcome"],
  fileName: string,
  bytes: Uint8Array,
): ProductImageVariantUploadSuccess {
  const info = readWebpImageInfo(bytes);

  if (!info) {
    throw new ProductImageVariantUploadError("STORED_UNCONFIRMED");
  }

  return {
    outcome,
    bucket: PRODUCT_IMAGES_BUCKET,
    fileName,
    width: info.width,
    height: info.height,
    bytes: bytes.byteLength,
  };
}

function storedVariantIsValid(
  bytes: Uint8Array,
  masterWidth: number,
  masterHeight: number,
  variantWidth: number,
): boolean {
  const info = readWebpImageInfo(bytes);

  return Boolean(
    info &&
      bytes.byteLength > 0 &&
      bytes.byteLength <= PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES &&
      variantMatchesMaster(masterWidth, masterHeight, variantWidth, info.height) &&
      info.width === variantWidth,
  );
}

function acceptedVariantBytes(bytes: Uint8Array, variantWidth: number): boolean {
  const info = readWebpImageInfo(bytes);

  return Boolean(
    isVariantWidth(variantWidth) &&
      bytes.byteLength > 0 &&
      bytes.byteLength <= PRODUCT_IMAGE_OPTIMIZED_MAX_BYTES &&
      info &&
      info.width === variantWidth &&
      info.height > 0 &&
      info.height <= PRODUCT_IMAGE_MASTER_MAX_EDGE &&
      info.width <= PRODUCT_IMAGE_MASTER_MAX_EDGE,
  );
}

function isVariantWidth(value: number): value is (typeof PRODUCT_IMAGE_VARIANT_WIDTHS)[number] {
  return PRODUCT_IMAGE_VARIANT_WIDTHS.some((width) => width === value);
}

function finiteSize(width: number, height: number): { width: number; height: number } | null {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  let text = "";

  for (let index = start; index < end; index += 1) {
    text += String.fromCharCode(bytes[index]);
  }

  return text;
}

function readU16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32LE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}
