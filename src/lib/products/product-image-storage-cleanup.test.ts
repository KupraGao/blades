import assert from "node:assert/strict";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  cleanupStoredProductImages,
  isExactProductImageObjectName,
  loadProductImageRefs,
  planProductImageCleanup,
  ProductStorageCleanupError,
  removeProductImageObject,
  type CatalogImageRef,
} from "./product-image-storage-cleanup";

const PRODUCT_A = "product-a";
const PRODUCT_B = "product-b";
const PRODUCT_C = "product-c";
const MASTER_A = "57bf30fc-2d23-4c93-9960-939aa6a5c0c9";
const MASTER_B = "11111111-1111-4111-8111-111111111111";
const MASTER_C = "22222222-2222-4222-8222-222222222222";
const WIDTHS = [128, 384, 768, 1280];

function imageUrl(id: string, query = "") {
  return `https://example.supabase.co/storage/v1/object/public/product-images/${id}-product-image.webp${query}`;
}

function objectNames(id: string) {
  return [
    ...WIDTHS.map((width) => `${id}-product-image-w${width}.webp`),
    `${id}-product-image.webp`,
  ];
}

class MemoryBucket {
  objects = new Set<string>([
    ...objectNames(MASTER_A),
    ...objectNames(MASTER_B),
    ...objectNames(MASTER_C),
  ]);
  calls: string[] = [];
  fail = new Set<string>();

  async removeExact(fileName: string) {
    assert.equal(fileName.includes("/"), false);
    assert.equal(isExactProductImageObjectName(fileName), true);
    this.calls.push(fileName);

    if (this.fail.has(fileName)) {
      return { error: { message: "partial" } };
    }

    this.objects.delete(fileName);
    return { error: null };
  }
}

function refs(): CatalogImageRef[] {
  return [
    { imageId: "image-a", productId: PRODUCT_A, imageUrl: imageUrl(MASTER_A) },
    { imageId: "image-b", productId: PRODUCT_B, imageUrl: `${imageUrl(MASTER_B)}?token=secret` },
    { imageId: "image-c", productId: PRODUCT_C, imageUrl: imageUrl(MASTER_C) },
    { imageId: "image-a-invalid", productId: PRODUCT_A, imageUrl: "https://example.com/not-a-master.jpg" },
  ];
}

async function expectCode(run: () => Promise<unknown>, code: string) {
  try {
    await run();
  } catch (error) {
    assert.ok(error instanceof ProductStorageCleanupError);
    assert.equal(error.code, code);
    return error;
  }

  assert.fail(`expected ${code}`);
}

assert.equal(isExactProductImageObjectName(`${MASTER_A}-product-image`), false);
assert.equal(isExactProductImageObjectName(`${MASTER_A}-product-image-w64.webp`), false);
assert.equal(isExactProductImageObjectName("../secret.webp"), false);

const single = planProductImageCleanup([PRODUCT_A], refs());
assert.deepEqual(single.fileNames, objectNames(MASTER_A));
assert.deepEqual(single.imageIds, ["image-a"]);
assert.deepEqual(
  single.skipped.map((item) => item.reason),
  ["invalid-url"],
);
assert.equal(single.fileNames.includes(`${MASTER_B}-product-image.webp`), false);
assert.equal(single.fileNames.includes(`${MASTER_C}-product-image.webp`), false);

const several = planProductImageCleanup([PRODUCT_A, PRODUCT_C], refs());
assert.deepEqual(several.fileNames, [...objectNames(MASTER_A), ...objectNames(MASTER_C)]);
assert.deepEqual(several.imageIds, ["image-a", "image-c"]);

const sharedImages: CatalogImageRef[] = [
  { imageId: "shared-a", productId: PRODUCT_A, imageUrl: imageUrl(MASTER_A) },
  { imageId: "shared-b", productId: PRODUCT_B, imageUrl: imageUrl(MASTER_A, "?download=1") },
  { imageId: "shared-c", productId: PRODUCT_C, imageUrl: imageUrl(MASTER_C) },
];
const shared = planProductImageCleanup([PRODUCT_A], sharedImages);
assert.deepEqual(shared.fileNames, []);
assert.deepEqual(shared.imageIds, []);
assert.equal(shared.skipped[0]?.reason, "shared");
const sharedTogether = planProductImageCleanup([PRODUCT_A, PRODUCT_B], sharedImages);
assert.deepEqual(sharedTogether.fileNames, objectNames(MASTER_A));
assert.deepEqual(sharedTogether.imageIds, ["shared-a", "shared-b"]);

const oneBucket = new MemoryBucket();
let oneDeleted = false;
const onePlan = await cleanupStoredProductImages({
  authorization: { admin: true },
  productIds: [PRODUCT_A],
  loadImages: async () => refs(),
  clearVariantWidths: async () => ({ error: null }),
  removeExact: (fileName) => oneBucket.removeExact(fileName),
  deleteDatabase: async () => {
    oneDeleted = true;
    return { error: null };
  },
});
assert.deepEqual(onePlan.fileNames, objectNames(MASTER_A));
assert.equal(oneDeleted, true);
for (const name of objectNames(MASTER_A)) {
  assert.equal(oneBucket.objects.has(name), false);
}
assert.equal(oneBucket.objects.has(`${MASTER_B}-product-image.webp`), true);
assert.equal(oneBucket.objects.has(`${MASTER_C}-product-image-w128.webp`), true);

const manyBucket = new MemoryBucket();
let manyDeleted = 0;
await cleanupStoredProductImages({
  authorization: { admin: true },
  productIds: [PRODUCT_A, PRODUCT_C],
  loadImages: async () => refs(),
  clearVariantWidths: async () => ({ error: null }),
  removeExact: (fileName) => manyBucket.removeExact(fileName),
  deleteDatabase: async () => {
    manyDeleted += 1;
    return { error: null };
  },
});
assert.equal(manyDeleted, 1);
assert.equal(manyBucket.objects.has(`${MASTER_A}-product-image.webp`), false);
assert.equal(manyBucket.objects.has(`${MASTER_C}-product-image.webp`), false);
assert.equal(manyBucket.objects.has(`${MASTER_B}-product-image.webp`), true);

const sharedBucket = new MemoryBucket();
let sharedDeleted = false;
await cleanupStoredProductImages({
  authorization: { admin: true },
  productIds: [PRODUCT_A],
  loadImages: async () => sharedImages,
  clearVariantWidths: async () => ({ error: null }),
  removeExact: (fileName) => sharedBucket.removeExact(fileName),
  deleteDatabase: async () => {
    sharedDeleted = true;
    return { error: null };
  },
});
assert.equal(sharedDeleted, true);
assert.deepEqual(sharedBucket.calls, []);
assert.equal(sharedBucket.objects.has(`${MASTER_A}-product-image.webp`), true);

const partialBucket = new MemoryBucket();
partialBucket.fail.add(`${MASTER_A}-product-image-w768.webp`);
let partialDeleted = false;
const partialCleared: string[] = [];
const partialError = await expectCode(
  () => cleanupStoredProductImages({
    authorization: { admin: true },
    productIds: [PRODUCT_A],
    loadImages: async () => refs(),
    clearVariantWidths: async (imageIds) => {
      partialCleared.push(...imageIds);
      return { error: null };
    },
    removeExact: (fileName) => partialBucket.removeExact(fileName),
    deleteDatabase: async () => {
      partialDeleted = true;
      return { error: null };
    },
  }),
  "STORAGE_FAILED",
);
assert.equal(partialError?.message, "partial");
assert.equal(partialDeleted, false);
assert.deepEqual(partialCleared, ["image-a"]);
assert.equal(partialBucket.objects.has(`${MASTER_A}-product-image-w128.webp`), false);
assert.equal(partialBucket.objects.has(`${MASTER_A}-product-image-w1280.webp`), true);
assert.equal(partialBucket.objects.has(`${MASTER_A}-product-image.webp`), true);
assert.equal(partialBucket.objects.has(`${MASTER_B}-product-image.webp`), true);

const metadataBucket = new MemoryBucket();
let metadataRemoved = false;
let metadataDeleted = false;
await expectCode(
  () => cleanupStoredProductImages({
    authorization: { admin: true },
    productIds: [PRODUCT_A],
    loadImages: async () => refs(),
    clearVariantWidths: async () => ({ error: { message: "metadata" } }),
    removeExact: async (fileName) => {
      metadataRemoved = true;
      return metadataBucket.removeExact(fileName);
    },
    deleteDatabase: async () => {
      metadataDeleted = true;
      return { error: null };
    },
  }),
  "METADATA_FAILED",
);
assert.equal(metadataRemoved, false);
assert.equal(metadataDeleted, false);
assert.equal(metadataBucket.objects.has(`${MASTER_A}-product-image.webp`), true);

const retryBucket = new MemoryBucket();
let databaseFailures = 1;
let databaseCalls = 0;
const retryInput = {
  authorization: { admin: true },
  productIds: [PRODUCT_A],
  loadImages: async () => [{ imageId: "image-a", productId: PRODUCT_A, imageUrl: imageUrl(MASTER_A) }],
  clearVariantWidths: async () => ({ error: null }),
  removeExact: (fileName: string) => retryBucket.removeExact(fileName),
  deleteDatabase: async () => {
    databaseCalls += 1;

    if (databaseFailures > 0) {
      databaseFailures -= 1;
      return { error: { message: "db failed" } };
    }

    return { error: null };
  },
};
const dbError = await expectCode(
  () => cleanupStoredProductImages(retryInput),
  "DB_FAILED_AFTER_STORAGE",
);
assert.equal(dbError?.message.includes("Retry is safe"), true);
assert.equal(databaseCalls, 1);
assert.equal(retryBucket.objects.has(`${MASTER_A}-product-image.webp`), false);
await cleanupStoredProductImages(retryInput);
assert.equal(databaseCalls, 2);
assert.equal(retryBucket.calls.length, objectNames(MASTER_A).length * 2);

let unauthorizedCalls = 0;
await expectCode(
  () => cleanupStoredProductImages({
    authorization: { admin: false },
    productIds: [PRODUCT_A],
    loadImages: async () => {
      unauthorizedCalls += 1;
      return refs();
    },
    clearVariantWidths: async () => {
      unauthorizedCalls += 1;
      return { error: null };
    },
    removeExact: async (fileName) => {
      unauthorizedCalls += 1;
      return { error: { message: fileName } };
    },
    deleteDatabase: async () => {
      unauthorizedCalls += 1;
      return { error: null };
    },
  }),
  "UNAUTHORIZED",
);
assert.equal(unauthorizedCalls, 0);

let readFailureDeleted = false;
await assert.rejects(
  () => cleanupStoredProductImages({
    authorization: { admin: true },
    productIds: [PRODUCT_A],
    loadImages: async () => {
      throw new Error("read failed");
    },
    clearVariantWidths: async () => ({ error: null }),
  removeExact: (fileName) => oneBucket.removeExact(fileName),
    deleteDatabase: async () => {
      readFailureDeleted = true;
      return { error: null };
    },
  }),
  /read failed/,
);
assert.equal(readFailureDeleted, false);

function pageClient(
  pages: { id: unknown; product_id: unknown; image_url: unknown }[][],
  failAt?: number,
) {
  let call = 0;

  return {
    from(table: string) {
      assert.equal(table, "product_images");

      return {
        select() {
          return {
            order() {
              return {
                range() {
                  const index = call;
                  call += 1;

                  if (failAt === index) {
                    return Promise.resolve({ data: null, error: { message: "page failed" } });
                  }

                  return Promise.resolve({ data: pages[index] ?? [], error: null });
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

const loaded = await loadProductImageRefs(pageClient([
  [
    { id: "image-a", product_id: PRODUCT_A, image_url: imageUrl(MASTER_A) },
    { id: "image-b", product_id: PRODUCT_B, image_url: imageUrl(MASTER_B) },
  ],
  [{ id: "image-c", product_id: PRODUCT_C, image_url: imageUrl(MASTER_C) }],
]), 2);
assert.deepEqual(loaded.map((item) => item.productId), [PRODUCT_A, PRODUCT_B, PRODUCT_C]);

await assert.rejects(
  () => loadProductImageRefs(pageClient([[]], 0), 2),
  /page failed/,
);
await assert.rejects(
  () => loadProductImageRefs(pageClient([[{ id: 7, product_id: PRODUCT_A, image_url: imageUrl(MASTER_A) }]]), 2),
  (error: unknown) => error instanceof ProductStorageCleanupError && error.code === "UNCONFIRMED_NAME",
);

const storageCalls: string[][] = [];
const removed = await removeProductImageObject({
  storage: {
    from(bucket: string) {
      assert.equal(bucket, "product-images");

      return {
        async remove(names: string[]) {
          storageCalls.push(names);
          return { error: null };
        },
      };
    },
  },
} as unknown as SupabaseClient, `${MASTER_A}-product-image.webp`);
assert.equal(removed.error, null);
assert.deepEqual(storageCalls, [[`${MASTER_A}-product-image.webp`]]);
const rejected = await removeProductImageObject(
  { storage: { from() { throw new Error("must not remove"); } } } as unknown as SupabaseClient,
  `${MASTER_A}-product-image`,
);
assert.equal(rejected.error?.message, "UNCONFIRMED_NAME");

console.log(JSON.stringify({
  single: single.fileNames.length,
  several: several.fileNames.length,
  retryCalls: retryBucket.calls.length,
}));
