import type { SupabaseClient } from "@supabase/supabase-js";

import {
  masterFileNameFromImageUrl,
  PRODUCT_IMAGES_BUCKET,
  variantFileNameFromMaster,
  variantObjectNamesFromMasterUrl,
} from "@/lib/products/product-image-variant-storage";
import { PRODUCT_IMAGE_VARIANT_WIDTHS } from "@/lib/products/product-image-dimensions";

/**
 * პროდუქტის წაშლამდე Storage გეგმა.
 * ბაზასა და Storage-ს საერთო ტრანზაქცია არ აქვს, ამიტომ ბაზა იშლება მხოლოდ დადასტურებული ფაილების შემდეგ.
 */

export type CatalogImageRef = {
  imageId: string;
  productId: string;
  imageUrl: string;
};

export type ProductImageCleanupSkip = {
  productId: string;
  imageUrl: string;
  reason: "invalid-url" | "shared";
};

export type ProductImageCleanupPlan = {
  fileNames: string[];
  imageIds: string[];
  skipped: ProductImageCleanupSkip[];
};

export type ProductStorageCleanupCode =
  | "UNAUTHORIZED"
  | "STORAGE_FAILED"
  | "DB_FAILED_AFTER_STORAGE"
  | "UNCONFIRMED_NAME"
  | "METADATA_FAILED";

export class ProductStorageCleanupError extends Error {
  readonly code: ProductStorageCleanupCode;

  constructor(code: ProductStorageCleanupCode, message: string = code) {
    super(code === "UNAUTHORIZED" ? "Unauthorized" : message);
    this.name = "ProductStorageCleanupError";
    this.code = code;
  }
}

const PAGE_SIZE = 1000;

export function isExactProductImageObjectName(fileName: string): boolean {
  if (
    fileName.length === 0 ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("..") ||
    /[?#%]/.test(fileName)
  ) {
    return false;
  }

  if (canonicalMasterName(fileName) === fileName) {
    return true;
  }

  for (const width of PRODUCT_IMAGE_VARIANT_WIDTHS) {
    const suffix = `-w${width}.webp`;

    if (!fileName.endsWith(suffix)) {
      continue;
    }

    const master = `${fileName.slice(0, -suffix.length)}.webp`;

    if (
      canonicalMasterName(master) === master &&
      variantFileNameFromMaster(master, width) === fileName
    ) {
      return true;
    }
  }

  return false;
}

export function planProductImageCleanup(
  targetProductIds: readonly string[],
  images: readonly CatalogImageRef[],
): ProductImageCleanupPlan {
  const targets = new Set(targetProductIds.filter((id) => id.length > 0));
  const ownersByMaster = new Map<string, Set<string>>();

  for (const image of images) {
    const master = masterFileNameFromImageUrl(image.imageUrl);

    if (!master) {
      continue;
    }

    const owners = ownersByMaster.get(master) ?? new Set<string>();
    owners.add(image.productId);
    ownersByMaster.set(master, owners);
  }

  const fileNames: string[] = [];
  const imageIds: string[] = [];
  const seen = new Set<string>();
  const seenImages = new Set<string>();
  const skipped: ProductImageCleanupSkip[] = [];

  for (const image of images) {
    if (!targets.has(image.productId)) {
      continue;
    }

    const master = masterFileNameFromImageUrl(image.imageUrl);
    const variants = master ? variantObjectNamesFromMasterUrl(image.imageUrl) : null;
    const names = master && variants ? [...variants, master] : null;
    const owners = master ? ownersByMaster.get(master) : undefined;
    const shared = [...(owners ?? [])].some((owner) => !targets.has(owner));

    if (!names || names.some((name) => !isExactProductImageObjectName(name))) {
      skipped.push({
        productId: image.productId,
        imageUrl: image.imageUrl,
        reason: "invalid-url",
      });
      continue;
    }

    if (shared) {
      skipped.push({
        productId: image.productId,
        imageUrl: image.imageUrl,
        reason: "shared",
      });
      continue;
    }

    for (const name of names) {
      if (seen.has(name)) {
        continue;
      }

      seen.add(name);
      fileNames.push(name);
    }

    if (image.imageId.length > 0 && !seenImages.has(image.imageId)) {
      seenImages.add(image.imageId);
      imageIds.push(image.imageId);
    }
  }

  return { fileNames, imageIds, skipped };
}

export async function loadProductImageRefs(
  supabase: SupabaseClient,
  pageSize = PAGE_SIZE,
): Promise<CatalogImageRef[]> {
  const refs: CatalogImageRef[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("product_images")
      .select("id, product_id, image_url")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    const rows = data ?? [];

    for (const row of rows) {
      if (
        !row ||
        typeof row.id !== "string" ||
        row.id.length === 0 ||
        typeof row.product_id !== "string" ||
        row.product_id.length === 0 ||
        typeof row.image_url !== "string"
      ) {
        throw new ProductStorageCleanupError(
          "UNCONFIRMED_NAME",
          "A product image row could not be confirmed.",
        );
      }

      refs.push({
        imageId: row.id,
        productId: row.product_id,
        imageUrl: row.image_url,
      });
    }

    if (rows.length < pageSize) {
      break;
    }
  }

  return refs;
}

export async function removeProductImageObject(
  supabase: SupabaseClient,
  fileName: string,
): Promise<{ error: { message: string } | null }> {
  if (!isExactProductImageObjectName(fileName)) {
    return { error: { message: "UNCONFIRMED_NAME" } };
  }

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([fileName]);

  return { error: error ? { message: error.message } : null };
}

export async function cleanupStoredProductImages(input: {
  authorization: { admin: boolean };
  productIds: readonly string[];
  loadImages: () => Promise<readonly CatalogImageRef[]>;
  clearVariantWidths: (
    imageIds: readonly string[],
  ) => Promise<{ error: { message: string } | null }>;
  removeExact: (fileName: string) => Promise<{ error: { message: string } | null }>;
  deleteDatabase: () => Promise<{ error: { message: string } | null }>;
}): Promise<ProductImageCleanupPlan> {
  if (input.authorization.admin !== true) {
    throw new ProductStorageCleanupError("UNAUTHORIZED");
  }

  const productIds = input.productIds.filter((id) => id.length > 0);

  if (productIds.length === 0) {
    await finishDatabase(input.deleteDatabase, false);
    return { fileNames: [], imageIds: [], skipped: [] };
  }

  const images = await input.loadImages();
  const plan = planProductImageCleanup(productIds, images);

  if (plan.fileNames.some((fileName) => !isExactProductImageObjectName(fileName))) {
    throw new ProductStorageCleanupError("UNCONFIRMED_NAME");
  }

  if (plan.skipped.length > 0) {
    console.warn(
      "PRODUCT IMAGE CLEANUP SKIPPED",
      plan.skipped.map((item) => item.reason),
    );
  }

  if (plan.imageIds.length > 0) {
    const cleared = await input.clearVariantWidths(plan.imageIds);

    if (cleared.error) {
      const message = cleared.error.message.trim() || "METADATA_FAILED";
      console.error("PRODUCT STORAGE CLEANUP", "METADATA_FAILED", message);
      throw new ProductStorageCleanupError("METADATA_FAILED", message);
    }
  }

  for (const fileName of plan.fileNames) {
    const { error } = await input.removeExact(fileName);

    if (error) {
      const message = error.message.trim() || "STORAGE_FAILED";
      console.error("PRODUCT STORAGE CLEANUP", "STORAGE_FAILED", message);
      throw new ProductStorageCleanupError("STORAGE_FAILED", message);
    }
  }

  await finishDatabase(input.deleteDatabase, plan.fileNames.length > 0);
  return plan;
}

async function finishDatabase(
  deleteDatabase: () => Promise<{ error: { message: string } | null }>,
  storageRemovedFiles: boolean,
) {
  const result = await deleteDatabase();

  if (!result.error) {
    return;
  }

  if (!storageRemovedFiles) {
    throw new Error(result.error.message);
  }

  const message = `${result.error.message} Storage cleanup already removed the planned product image files. Retry is safe while the database rows remain.`;
  console.error("PRODUCT STORAGE CLEANUP", "DB_FAILED_AFTER_STORAGE", message);
  throw new ProductStorageCleanupError("DB_FAILED_AFTER_STORAGE", message);
}

function canonicalMasterName(fileName: string): string | null {
  return masterFileNameFromImageUrl(
    `https://example.supabase.co/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${fileName}`,
  );
}
