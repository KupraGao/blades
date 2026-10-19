import assert from "node:assert/strict";

import type { SupabaseClient } from "@supabase/supabase-js";

import { deleteGalleryImageRecord } from "./delete-gallery-image-record";
import {
  ProductImageVariantCleanupError,
  removeExactProductImageVariants,
  variantObjectNamesFromMasterUrl,
} from "./product-image-variant-storage";

const MASTER_ID = "57bf30fc-2d23-4c93-9960-939aa6a5c0c9";
const OTHER_ID = "11111111-1111-4111-8111-111111111111";
const MASTER_NAME = `${MASTER_ID}-product-image.webp`;
const OTHER_MASTER = `${OTHER_ID}-product-image.webp`;
const IMAGE_URL =
  `https://example.supabase.co/storage/v1/object/public/product-images/${MASTER_NAME}`;
const WIDTHS = [128, 384, 768, 1280];

function variantName(id: string, width: number) {
  return `${id}-product-image-w${width}.webp`;
}

function namesFor(id: string) {
  return WIDTHS.map((width) => variantName(id, width));
}

class MemoryBucket {
  objects = new Set<string>([
    MASTER_NAME,
    ...namesFor(MASTER_ID),
    OTHER_MASTER,
    ...namesFor(OTHER_ID),
  ]);
  calls: string[] = [];
  fail = new Set<string>();

  async removeExact(fileName: string) {
    this.calls.push(fileName);

    if (this.fail.has(fileName)) {
      return { error: { message: "partial" } };
    }

    this.objects.delete(fileName);
    return { error: null };
  }
}

async function expectCleanupCode(
  run: () => Promise<unknown>,
  code: string,
) {
  try {
    await run();
  } catch (error) {
    assert.ok(error instanceof ProductImageVariantCleanupError);
    assert.equal(error.code, code);
    return error;
  }

  assert.fail(`expected ${code}`);
}

const derived = variantObjectNamesFromMasterUrl(IMAGE_URL);
assert.deepEqual(derived, namesFor(MASTER_ID));
assert.equal(derived?.includes(MASTER_NAME), false);
assert.equal(derived?.some((name) => name.includes(OTHER_ID)), false);
assert.equal(
  variantObjectNamesFromMasterUrl(`${IMAGE_URL}?token=secret`)?.length,
  4,
);

for (const imageUrl of [
  "not a url",
  "https://example.supabase.co/storage/v1/object/public/other/file.webp",
  `https://example.supabase.co/storage/v1/object/public/product-images/${variantName(MASTER_ID, 128)}`,
  `https://example.supabase.co/storage/v1/object/public/product-images/${MASTER_ID}-product-image.webp/extra`,
  `https://example.supabase.co/storage/v1/object/public/product-images/..%2Fsecret.webp`,
  "https://example.supabase.co/storage/v1/object/public/product-images/photo.jpg",
]) {
  assert.equal(variantObjectNamesFromMasterUrl(imageUrl), null);
  const bucket = new MemoryBucket();
  const before = [...bucket.objects];
  await expectCleanupCode(
    () => removeExactProductImageVariants({ admin: true }, (name) => bucket.removeExact(name), imageUrl),
    "INVALID_MASTER",
  );
  assert.deepEqual([...bucket.objects], before);
  assert.deepEqual(bucket.calls, []);
}

const owned = new MemoryBucket();
assert.equal(
  await removeExactProductImageVariants(
    { admin: true },
    (name) => owned.removeExact(name),
    IMAGE_URL,
  ),
  "removed",
);
assert.deepEqual(owned.calls, namesFor(MASTER_ID));
for (const name of namesFor(MASTER_ID)) {
  assert.equal(owned.objects.has(name), false);
  assert.equal(name.includes("/"), false);
  assert.equal(name.endsWith(".webp"), true);
}
assert.equal(owned.objects.has(MASTER_NAME), true);
assert.equal(owned.objects.has(OTHER_MASTER), true);
for (const name of namesFor(OTHER_ID)) {
  assert.equal(owned.objects.has(name), true);
}

assert.equal(
  await removeExactProductImageVariants(
    { admin: true },
    (name) => owned.removeExact(name),
    IMAGE_URL,
  ),
  "removed",
);
assert.equal(owned.calls.length, 8);

const partial = new MemoryBucket();
partial.fail.add(variantName(MASTER_ID, 768));
const partialError = await expectCleanupCode(
  () => removeExactProductImageVariants(
    { admin: true },
    (name) => partial.removeExact(name),
    IMAGE_URL,
  ),
  "STORAGE_FAILED",
);
assert.equal(partialError?.message, "partial");
assert.deepEqual(partial.calls, [
  variantName(MASTER_ID, 128),
  variantName(MASTER_ID, 384),
  variantName(MASTER_ID, 768),
]);
assert.equal(partial.objects.has(variantName(MASTER_ID, 128)), false);
assert.equal(partial.objects.has(variantName(MASTER_ID, 1280)), true);
assert.equal(partial.objects.has(MASTER_NAME), true);
assert.equal(partial.objects.has(OTHER_MASTER), true);

const denied = new MemoryBucket();
const deniedBefore = [...denied.objects];
await expectCleanupCode(
  () => removeExactProductImageVariants(
    { admin: false },
    (name) => denied.removeExact(name),
    IMAGE_URL,
  ),
  "UNAUTHORIZED",
);
assert.deepEqual(denied.calls, []);
assert.deepEqual([...denied.objects], deniedBefore);

function galleryClient(imageUrl: string, failName?: string, failBlock = false) {
  const removed: string[] = [];
  const deleted: string[] = [];
  const order: string[] = [];
  const updates: unknown[] = [];
  const client = {
    from(table: string) {
      if (table !== "product_images") {
        throw new Error(table);
      }

      return {
        select() {
          return {
            eq() {
              return {
                async single() {
                  return {
                    data: { image_url: imageUrl, product_id: "42" },
                    error: null,
                  };
                },
                order() {
                  return Promise.resolve({ data: [], error: null });
                },
              };
            },
          };
        },
        update(payload: unknown) {
          updates.push(payload);
          const filters: Record<string, unknown> = {};
          const chain = {
            eq(column: string, value: unknown) {
              filters[column] = value;
              return chain;
            },
            async select() {
              order.push("block");

              if (failBlock || filters.id == null || String(filters.product_id) !== "42") {
                return { data: [], error: failBlock ? { message: "metadata" } : null };
              }

              return { data: [{ id: filters.id }], error: null };
            },
          };
          return chain;
        },
        delete() {
          return {
            async eq(_column: string, id: string) {
              deleted.push(id);
              return { error: null };
            },
          };
        },
      };
    },
    storage: {
      from(bucket: string) {
        if (bucket !== "product-images") {
          throw new Error(bucket);
        }

        return {
          async remove(names: string[]) {
            if (names.length !== 1) {
              return { data: null, error: { message: "broad delete" } };
            }

            order.push(`file:${names[0]}`);
            removed.push(names[0]);

            if (names[0] === failName) {
              return { data: null, error: { message: "partial" } };
            }

            return { data: [], error: null };
          },
        };
      },
    },
  };

  return {
    client: client as unknown as SupabaseClient,
    removed,
    deleted,
    order,
    updates,
  };
}

const gallery = galleryClient(IMAGE_URL);
const galleryResult = await deleteGalleryImageRecord(
  gallery.client,
  "image-1",
  { admin: true },
);
assert.equal(galleryResult.productId, "42");
assert.deepEqual(gallery.updates, [{ variant_writes_blocked: true, variant_widths: [] }]);
assert.deepEqual(gallery.order, ["block", ...namesFor(MASTER_ID).map((name) => `file:${name}`), `file:${MASTER_NAME}`]);
assert.deepEqual(gallery.removed, [...namesFor(MASTER_ID), MASTER_NAME]);
assert.deepEqual(gallery.deleted, ["image-1"]);

const blocked = galleryClient(IMAGE_URL, variantName(MASTER_ID, 768));
await expectCleanupCode(
  () => deleteGalleryImageRecord(blocked.client, "image-1", { admin: true }),
  "STORAGE_FAILED",
);
assert.deepEqual(blocked.order[0], "block");
assert.deepEqual(blocked.removed, [
  variantName(MASTER_ID, 128),
  variantName(MASTER_ID, 384),
  variantName(MASTER_ID, 768),
]);
assert.equal(blocked.removed.includes(MASTER_NAME), false);
assert.deepEqual(blocked.deleted, []);

const metadataBlocked = galleryClient(IMAGE_URL, undefined, true);
await expectCleanupCode(
  () => deleteGalleryImageRecord(metadataBlocked.client, "image-1", { admin: true }),
  "METADATA_FAILED",
);
assert.deepEqual(metadataBlocked.order, ["block"]);
assert.deepEqual(metadataBlocked.removed, []);
assert.deepEqual(metadataBlocked.deleted, []);

const legacy = galleryClient(
  "https://example.supabase.co/storage/v1/object/public/product-images/photo.jpg",
);
await deleteGalleryImageRecord(legacy.client, "image-2", { admin: true });
assert.deepEqual(legacy.order, ["block", "file:photo.jpg"]);
assert.deepEqual(legacy.removed, ["photo.jpg"]);
assert.deepEqual(legacy.deleted, ["image-2"]);

let unauthorizedTouched = false;
const closed = new Proxy({}, {
  get() {
    unauthorizedTouched = true;
    throw new Error("storage was touched");
  },
}) as SupabaseClient;
await expectCleanupCode(
  () => deleteGalleryImageRecord(closed, "image-1", { admin: false }),
  "UNAUTHORIZED",
);
assert.equal(unauthorizedTouched, false);

console.log(JSON.stringify({
  variants: derived,
  repeatCalls: owned.calls.length,
  galleryRemoved: gallery.removed.length,
}));
