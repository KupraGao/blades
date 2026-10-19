import assert from "node:assert/strict";

import { productImageDelivery } from "./product-image-delivery";
import {
  blockProductImageVariantWrites,
  clearStoredVariantWidths,
  createProductImageVariantMetadataWriter,
  mergeConfirmedVariantWidth,
} from "./product-image-variant-metadata";
import {
  cleanupStoredProductImages,
  type CatalogImageRef,
} from "./product-image-storage-cleanup";
import {
  ProductImageVariantUploadError,
  uploadProductImageVariantRecord,
  type ProductImageVariantMetadataWriter,
} from "./product-image-variant-storage";

const IMAGE_ID = "image-1";
const OTHER_ID = "image-2";
const PRODUCT_ID = "42";
const OTHER_PRODUCT = "99";
const MASTER_ID = "57bf30fc-2d23-4c93-9960-939aa6a5c0c9";
const OTHER_MASTER = "11111111-1111-4111-8111-111111111111";
const MASTER_NAME = `${MASTER_ID}-product-image.webp`;
const OTHER_NAME = `${OTHER_MASTER}-product-image.webp`;
const IMAGE_URL =
  `https://example.supabase.co/storage/v1/object/public/product-images/${MASTER_NAME}`;
const OTHER_URL =
  `https://example.supabase.co/storage/v1/object/public/product-images/${OTHER_NAME}`;

type ImageRow = {
  id: string;
  productId: string;
  widths: number[];
  blocked: boolean;
};

function webp(width: number, height: number) {
  const bytes = new Uint8Array(new ArrayBuffer(30));
  const canvasWidth = width - 1;
  const canvasHeight = height - 1;

  bytes.set([0x52, 0x49, 0x46, 0x46, 22, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 0);
  bytes.set([0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0], 12);
  bytes[24] = canvasWidth & 0xff;
  bytes[25] = (canvasWidth >> 8) & 0xff;
  bytes[26] = (canvasWidth >> 16) & 0xff;
  bytes[27] = canvasHeight & 0xff;
  bytes[28] = (canvasHeight >> 8) & 0xff;
  bytes[29] = (canvasHeight >> 16) & 0xff;
  return bytes;
}

function variantName(width: number) {
  return `${MASTER_ID}-product-image-w${width}.webp`;
}

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function database() {
  const rows = new Map<string, ImageRow>([
    [IMAGE_ID, { id: IMAGE_ID, productId: PRODUCT_ID, widths: [], blocked: false }],
    [OTHER_ID, { id: OTHER_ID, productId: OTHER_PRODUCT, widths: [128], blocked: false }],
  ]);
  const events: string[] = [];
  let tail = Promise.resolve();
  const locked = <T>(run: () => T | Promise<T>) => {
    const result = tail.then(run, run);
    tail = result.then(() => undefined, () => undefined);
    return result;
  };
  const client = {
    async rpc(name: string, args: {
      target_product_id: string;
      target_image_id: string;
      target_width: number;
    }) {
      return locked(() => {
        events.push(`append:${args.target_image_id}:${args.target_width}`);

        if (name !== "append_product_image_variant_width") {
          return { data: null, error: { message: "unexpected" } };
        }

        const row = rows.get(args.target_image_id);

        if (!row || row.productId !== args.target_product_id) {
          return { data: null, error: { message: "image_not_found" } };
        }

        if (row.blocked) {
          return { data: null, error: { message: "writes_blocked" } };
        }

        const merged = mergeConfirmedVariantWidth(row.widths, args.target_width);

        if (!merged) {
          return { data: null, error: { message: "invalid_variant_width" } };
        }

        row.widths = merged;
        return { data: [...merged], error: null };
      });
    },
    from(table: string) {
      assert.equal(table, "product_images");

      return {
        update(payload: { variant_writes_blocked?: boolean; variant_widths?: number[] }) {
          const filters: Record<string, unknown> = {};
          const ids: string[] = [];
          const chain = {
            eq(column: string, value: unknown) {
              filters[column] = value;
              return chain;
            },
            in(column: string, values: readonly string[]) {
              if (column === "id") {
                ids.push(...values);
              }
              return chain;
            },
            select() {
              return locked(() => {
                events.push("block");
                const targets = ids.length > 0 ? ids : [String(filters.id ?? "")];
                const updated: { id: string }[] = [];

                for (const id of targets) {
                  const row = rows.get(id);

                  if (!row) {
                    continue;
                  }

                  if (
                    filters.product_id != null &&
                    String(row.productId) !== String(filters.product_id)
                  ) {
                    continue;
                  }

                  row.blocked = payload.variant_writes_blocked === true;
                  row.widths = [...(payload.variant_widths ?? [])];
                  updated.push({ id });
                }

                return { data: updated, error: null };
              });
            },
          };
          return chain;
        },
      };
    },
  };

  return { rows, events, client };
}

class Files {
  objects = new Map<string, Uint8Array>();
  events: string[] = [];

  async download(fileName: string) {
    return this.objects.get(fileName) ?? null;
  }

  async uploadNew(fileName: string, bytes: Uint8Array) {
    this.events.push(`store:${fileName}`);

    if (this.objects.has(fileName)) {
      return "conflict" as const;
    }

    this.objects.set(fileName, bytes);
    return "created" as const;
  }
}

const master = webp(2048, 1536);

function request(width: number, height: number) {
  return {
    productId: PRODUCT_ID,
    imageId: IMAGE_ID,
    variantWidth: width,
    bytes: webp(width, height),
    contentType: "image/webp",
  };
}

async function expectUploadCode(run: () => Promise<unknown>, code: string) {
  try {
    await run();
  } catch (error) {
    assert.ok(error instanceof ProductImageVariantUploadError);
    assert.equal(error.message, code);
    return;
  }

  assert.fail(`expected ${code}`);
}

const open = database();
const openFiles = new Files();
openFiles.objects.set(MASTER_NAME, master);
const created = await uploadProductImageVariantRecord(
  { async findOwnedImage() { return IMAGE_URL; } },
  openFiles,
  createProductImageVariantMetadataWriter(open.client as never),
  request(128, 96),
);
assert.equal(created.outcome, "created");
assert.deepEqual(open.rows.get(IMAGE_ID)?.widths, [128]);
assert.equal(open.rows.get(IMAGE_ID)?.blocked, false);
assert.equal(openFiles.objects.has(variantName(128)), true);

const closed = database();
const closedRow = closed.rows.get(IMAGE_ID);
assert.ok(closedRow);
closedRow.blocked = true;
const closedFiles = new Files();
closedFiles.objects.set(MASTER_NAME, master);
await expectUploadCode(
  () => uploadProductImageVariantRecord(
    { async findOwnedImage() { return IMAGE_URL; } },
    closedFiles,
    createProductImageVariantMetadataWriter(closed.client as never),
    request(384, 288),
  ),
  "WRITES_BLOCKED",
);
assert.deepEqual(closed.rows.get(IMAGE_ID)?.widths, []);
assert.equal(closed.events.at(-1), `append:${IMAGE_ID}:384`);

const raced = database();
const racedFiles = new Files();
racedFiles.objects.set(MASTER_NAME, master);
racedFiles.objects.set(`${OTHER_MASTER}-product-image-w128.webp`, webp(128, 96));
const confirmed = deferred();
const deleted = deferred();
const pausingWriter: ProductImageVariantMetadataWriter = {
  async rememberConfirmedWidth(productId, imageId, width) {
    raced.events.push("upload:confirmed");
    confirmed.resolve();
    await deleted.promise;
    return createProductImageVariantMetadataWriter(raced.client as never)
      .rememberConfirmedWidth(productId, imageId, width);
  },
};
const upload = uploadProductImageVariantRecord(
  { async findOwnedImage() { return IMAGE_URL; } },
  racedFiles,
  pausingWriter,
  request(384, 288),
);
const uploadResult = upload.then(
  () => "success" as const,
  (error: unknown) => {
    assert.ok(error instanceof ProductImageVariantUploadError);
    return error.message;
  },
);
await confirmed.promise;
await blockProductImageVariantWrites(raced.client as never, PRODUCT_ID, IMAGE_ID);
racedFiles.objects.delete(variantName(384));
raced.events.push("delete:file");
deleted.resolve();
assert.equal(await uploadResult, "WRITES_BLOCKED");
assert.deepEqual(raced.rows.get(IMAGE_ID)?.widths, []);
assert.equal(raced.rows.get(IMAGE_ID)?.blocked, true);
assert.equal(racedFiles.objects.has(variantName(384)), false);
assert.equal(racedFiles.objects.has(MASTER_NAME), true);
assert.deepEqual(raced.rows.get(OTHER_ID)?.widths, [128]);
assert.equal(raced.rows.get(OTHER_ID)?.blocked, false);
assert.equal(racedFiles.objects.has(`${OTHER_MASTER}-product-image-w128.webp`), true);
assert.deepEqual(
  raced.events.filter((event) => event === "block" || event === "upload:confirmed" || event === "delete:file" || event.startsWith("append:")),
  ["upload:confirmed", "block", "delete:file", `append:${IMAGE_ID}:384`],
);
assert.equal(productImageDelivery(IMAGE_URL, raced.rows.get(IMAGE_ID)?.widths).srcSet, undefined);

const failedMetadata = database();
const failedFiles = new Files();
failedFiles.objects.set(MASTER_NAME, master);
await expectUploadCode(
  () => uploadProductImageVariantRecord(
    { async findOwnedImage() { return IMAGE_URL; } },
    failedFiles,
    {
      async rememberConfirmedWidth() {
        throw new Error("db");
      },
    },
    request(768, 576),
  ),
  "METADATA_FAILED",
);
assert.equal(failedFiles.objects.has(variantName(768)), true);
assert.deepEqual(failedMetadata.rows.get(IMAGE_ID)?.widths, []);

const shared = database();
const imageA = "image-a";
const imageB = "image-b";
shared.rows.set(imageA, { id: imageA, productId: "product-a", widths: [128, 768], blocked: false });
shared.rows.set(imageB, { id: imageB, productId: "product-b", widths: [384], blocked: false });
const partialFiles = new Set([
  `${MASTER_ID}-product-image-w128.webp`,
  `${MASTER_ID}-product-image-w384.webp`,
  `${MASTER_ID}-product-image-w768.webp`,
  `${MASTER_ID}-product-image-w1280.webp`,
  MASTER_NAME,
  OTHER_NAME,
]);
const refs: CatalogImageRef[] = [
  { imageId: imageA, productId: "product-a", imageUrl: IMAGE_URL },
  { imageId: imageB, productId: "product-b", imageUrl: OTHER_URL },
];
let databaseDeleted = false;
await assert.rejects(
  () => cleanupStoredProductImages({
    authorization: { admin: true },
    productIds: ["product-a"],
    loadImages: async () => refs,
    clearVariantWidths: (imageIds) => clearStoredVariantWidths(shared.client as never, imageIds),
    removeExact: async (fileName) => {
      shared.events.push(`file:${fileName}`);

      if (fileName.endsWith("-w768.webp")) {
        return { error: { message: "partial" } };
      }

      partialFiles.delete(fileName);
      return { error: null };
    },
    deleteDatabase: async () => {
      databaseDeleted = true;
      return { error: null };
    },
  }),
  (error: unknown) => error instanceof Error && error.message === "partial",
);
assert.equal(databaseDeleted, false);
assert.equal(shared.events[0], "block");
assert.ok(shared.events.indexOf("block") < shared.events.findIndex((event) => event.startsWith("file:")));
assert.deepEqual(shared.rows.get(imageA)?.widths, []);
assert.equal(shared.rows.get(imageA)?.blocked, true);
assert.equal(partialFiles.has(MASTER_NAME), true);
assert.equal(partialFiles.has(OTHER_NAME), true);
assert.deepEqual(shared.rows.get(imageB)?.widths, [384]);
assert.equal(shared.rows.get(imageB)?.blocked, false);
const retryFiles = new Files();
retryFiles.objects.set(MASTER_NAME, master);
await expectUploadCode(
  () => uploadProductImageVariantRecord(
    { async findOwnedImage() { return IMAGE_URL; } },
    retryFiles,
    createProductImageVariantMetadataWriter(shared.client as never),
    {
      productId: "product-a",
      imageId: imageA,
      variantWidth: 128,
      bytes: webp(128, 96),
      contentType: "image/webp",
    },
  ),
  "WRITES_BLOCKED",
);
assert.deepEqual(shared.rows.get(imageA)?.widths, []);

await blockProductImageVariantWrites(shared.client as never, "product-a", imageA);
assert.equal(shared.rows.get(imageA)?.blocked, true);
assert.deepEqual(shared.rows.get(imageA)?.widths, []);

const incomplete = await clearStoredVariantWidths(shared.client as never, [imageA, "missing-image"]);
assert.equal(incomplete.error?.message, "METADATA_FAILED");
assert.equal(productImageDelivery(OTHER_URL, shared.rows.get(imageB)?.widths).srcSet?.includes("384w"), true);

console.log(JSON.stringify({
  race: raced.events.filter((event) => !event.startsWith("store:")),
}));
