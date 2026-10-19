import assert from "node:assert/strict";

import { variantHeightFromMaster } from "./product-image-dimensions";
import {
  confirmedVariantWidths,
  createOwnedProductImageLookup,
  createProductImageVariantStore,
  isStorageConflict,
  masterFileNameFromImageUrl,
  ProductImageVariantUploadError,
  readProductImageVariantUpload,
  readWebpImageInfo,
  uploadProductImageVariantRecord,
  variantFileNameFromMaster,
  variantMatchesMaster,
  type OwnedProductImageLookup,
  type ProductImageVariantObjectStore,
} from "./product-image-variant-storage";

const MASTER_ID = "57bf30fc-2d23-4c93-9960-939aa6a5c0c9";
const MASTER_NAME = `${MASTER_ID}-product-image.webp`;
const IMAGE_URL =
  `https://example.supabase.co/storage/v1/object/public/product-images/${MASTER_NAME}`;

function riffWebp(chunk: string, payload: Uint8Array): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(20 + payload.length));
  const size = bytes.length - 8;

  bytes.set([0x52, 0x49, 0x46, 0x46, size, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 0);
  bytes.set([chunk.charCodeAt(0), chunk.charCodeAt(1), chunk.charCodeAt(2), chunk.charCodeAt(3)], 12);
  bytes[16] = payload.length;
  bytes.set(payload, 20);

  return bytes;
}

function lossyWebp(width: number, height: number): Uint8Array<ArrayBuffer> {
  const payload = new Uint8Array(10);

  payload.set([0, 0, 0, 0x9d, 0x01, 0x2a, width & 0xff, (width >> 8) & 0x3f, height & 0xff, (height >> 8) & 0x3f]);

  return riffWebp("VP8 ", payload);
}

function losslessWebp(width: number, height: number): Uint8Array<ArrayBuffer> {
  const bits = (width - 1) | ((height - 1) << 14);
  const payload = new Uint8Array(5);

  payload[0] = 0x2f;
  payload[1] = bits & 0xff;
  payload[2] = (bits >> 8) & 0xff;
  payload[3] = (bits >> 16) & 0xff;
  payload[4] = (bits >> 24) & 0xff;

  return riffWebp("VP8L", payload);
}

function webp(width: number, height: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(30));
  const size = 22;
  const canvasWidth = width - 1;
  const canvasHeight = height - 1;

  bytes.set([0x52, 0x49, 0x46, 0x46, size, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 0);
  bytes.set([0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0], 12);
  bytes[24] = canvasWidth & 0xff;
  bytes[25] = (canvasWidth >> 8) & 0xff;
  bytes[26] = (canvasWidth >> 16) & 0xff;
  bytes[27] = canvasHeight & 0xff;
  bytes[28] = (canvasHeight >> 8) & 0xff;
  bytes[29] = (canvasHeight >> 16) & 0xff;

  return bytes;
}

function lookup(imageUrl: string | null): OwnedProductImageLookup {
  return {
    async findOwnedImage() {
      return imageUrl;
    },
  };
}

class MemoryStore implements ProductImageVariantObjectStore {
  objects = new Map<string, Uint8Array>();
  uploads: string[] = [];
  removed = 0;
  failUpload = false;
  hideDownload = false;

  async download(fileName: string) {
    if (this.hideDownload) {
      return null;
    }

    const found = this.objects.get(fileName);

    return found ? found.slice() : null;
  }

  async uploadNew(fileName: string, bytes: Uint8Array) {
    this.uploads.push(fileName);

    if (this.failUpload) {
      return "failed" as const;
    }

    if (this.objects.has(fileName)) {
      return "conflict" as const;
    }

    this.objects.set(fileName, bytes.slice());
    return "created" as const;
  }
}

async function expectCode(run: () => Promise<unknown>, code: string) {
  try {
    await run();
  } catch (error) {
    assert.ok(error instanceof ProductImageVariantUploadError);
    assert.equal(error.code, code);
    return;
  }

  assert.fail(`expected ${code}`);
}

const parsed = readWebpImageInfo(webp(128, 96));
assert.deepEqual(parsed, { width: 128, height: 96 });
assert.deepEqual(readWebpImageInfo(lossyWebp(128, 96)), { width: 128, height: 96 });
assert.deepEqual(readWebpImageInfo(losslessWebp(128, 96)), { width: 128, height: 96 });
assert.equal(readWebpImageInfo(Uint8Array.from([0xff, 0xd8, 0xff])), null);
assert.equal(readWebpImageInfo(webp(128, 96).slice(0, 20)), null);

assert.equal(masterFileNameFromImageUrl(IMAGE_URL), MASTER_NAME);
assert.equal(masterFileNameFromImageUrl(`${IMAGE_URL}?token=secret`), MASTER_NAME);
assert.equal(masterFileNameFromImageUrl("https://example.supabase.co/storage/v1/object/public/other/file.webp"), null);
assert.equal(masterFileNameFromImageUrl("not a url"), null);
assert.equal(
  variantFileNameFromMaster(MASTER_NAME, 128),
  `${MASTER_ID}-product-image-w128.webp`,
);
assert.notEqual(variantFileNameFromMaster(MASTER_NAME, 128), MASTER_NAME);

const master = webp(2048, 1536);
assert.equal(variantHeightFromMaster(2048, 1536, 1280), 960);
assert.equal(variantMatchesMaster(2048, 1536, 1280, 960), true);
assert.equal(variantMatchesMaster(2048, 1536, 1280, 961), false);
assert.equal(variantMatchesMaster(129, 2048, 128, 2032), true);
assert.equal(variantMatchesMaster(129, 2048, 128, 2033), false);
assert.equal(variantMatchesMaster(100, 100, 128, 64), false);

const form = new FormData();
form.set("productId", "42");
form.set("imageId", "image-1");
form.set("variantWidth", "128");
form.set("file", new File([webp(128, 96).buffer], "w128.webp", { type: "image/webp" }));
const input = await readProductImageVariantUpload(form);
assert.equal(input.variantWidth, 128);
assert.equal(input.bytes.byteLength, 30);

const tooBig = new FormData();
tooBig.set("productId", "42");
tooBig.set("imageId", "image-1");
tooBig.set("variantWidth", "128");
tooBig.set("file", new File([new Uint8Array(2 * 1024 * 1024 + 1)], "w128.webp", { type: "image/webp" }));
await expectCode(() => readProductImageVariantUpload(tooBig), "INVALID_VARIANT");

const store = new MemoryStore();
store.objects.set(MASTER_NAME, master);
const quietMetadata = {
  calls: [] as number[],
  async rememberConfirmedWidth(_productId: string, _imageId: string, width: number) {
    this.calls.push(width);
  },
};
const created = await uploadProductImageVariantRecord(
  lookup(IMAGE_URL),
  store,
  quietMetadata,
  {
    productId: "42",
    imageId: "image-1",
    variantWidth: 1280,
    bytes: webp(1280, 960),
    contentType: "image/webp",
  },
);
assert.equal(created.outcome, "created");
assert.equal(created.bucket, "product-images");
assert.equal(created.fileName, `${MASTER_ID}-product-image-w1280.webp`);
assert.deepEqual(created, {
  outcome: "created",
  bucket: "product-images",
  fileName: `${MASTER_ID}-product-image-w1280.webp`,
  width: 1280,
  height: 960,
  bytes: 30,
});
assert.deepEqual(store.uploads, [created.fileName]);
assert.deepEqual(quietMetadata.calls, [1280]);

const again = await uploadProductImageVariantRecord(
  lookup(IMAGE_URL),
  store,
  quietMetadata,
  {
    productId: "42",
    imageId: "image-1",
    variantWidth: 1280,
    bytes: webp(1280, 960),
    contentType: "image/webp",
  },
);
assert.equal(again.outcome, "already-stored");
assert.equal(store.uploads.length, 2);
assert.equal(store.objects.get(created.fileName)?.byteLength, 30);

store.objects.set(created.fileName, webp(1280, 961));
await expectCode(
  () => uploadProductImageVariantRecord(lookup(IMAGE_URL), store, quietMetadata, {
    productId: "42",
    imageId: "image-1",
    variantWidth: 1280,
    bytes: webp(1280, 960),
    contentType: "image/webp",
  }),
  "EXISTING_UNCONFIRMED",
);
assert.equal(store.objects.get(created.fileName)?.[27], webp(1280, 961)[27]);
assert.equal(store.removed, 0);

const failing = new MemoryStore();
failing.objects.set(MASTER_NAME, master);
failing.failUpload = true;
await expectCode(
  () => uploadProductImageVariantRecord(lookup(IMAGE_URL), failing, quietMetadata, {
    productId: "42",
    imageId: "image-1",
    variantWidth: 1280,
    bytes: webp(1280, 960),
    contentType: "image/webp",
  }),
  "UPLOAD_FAILED",
);
assert.equal(failing.objects.has(`${MASTER_ID}-product-image-w1280.webp`), false);

const hidden = new MemoryStore();
hidden.objects.set(MASTER_NAME, master);
hidden.hideDownload = true;
await expectCode(
  () => uploadProductImageVariantRecord(lookup(IMAGE_URL), hidden, quietMetadata, {
    productId: "42",
    imageId: "image-1",
    variantWidth: 1280,
    bytes: webp(1280, 960),
    contentType: "image/webp",
  }),
  "INVALID_MASTER",
);

const unconfirmed = new MemoryStore();
unconfirmed.objects.set(MASTER_NAME, master);
const originalDownload = unconfirmed.download.bind(unconfirmed);
unconfirmed.download = async (fileName) => {
  if (fileName === MASTER_NAME) {
    return originalDownload(fileName);
  }

  return null;
};
await expectCode(
  () => uploadProductImageVariantRecord(lookup(IMAGE_URL), unconfirmed, quietMetadata, {
    productId: "42",
    imageId: "image-1",
    variantWidth: 1280,
    bytes: webp(1280, 960),
    contentType: "image/webp",
  }),
  "STORED_UNCONFIRMED",
);
assert.equal(unconfirmed.objects.has(`${MASTER_ID}-product-image-w1280.webp`), true);
assert.equal(unconfirmed.removed, 0);
assert.equal(quietMetadata.calls.length, 2);

const metadataStore = new MemoryStore();
metadataStore.objects.set(MASTER_NAME, master);
await expectCode(
  () => uploadProductImageVariantRecord(lookup(IMAGE_URL), metadataStore, {
    async rememberConfirmedWidth() {
      throw new Error("db");
    },
  }, {
    productId: "42",
    imageId: "image-1",
    variantWidth: 384,
    bytes: webp(384, 288),
    contentType: "image/webp",
  }),
  "METADATA_FAILED",
);
assert.equal(metadataStore.removed, 0);
assert.equal(metadataStore.objects.has(`${MASTER_ID}-product-image-w384.webp`), true);

await expectCode(
  () => uploadProductImageVariantRecord(lookup(null), store, quietMetadata, {
    productId: "42",
    imageId: "missing",
    variantWidth: 128,
    bytes: webp(128, 96),
    contentType: "image/webp",
  }),
  "IMAGE_NOT_FOUND",
);

await expectCode(
  () => uploadProductImageVariantRecord(lookup("https://example.com/other/file.webp"), new MemoryStore(), quietMetadata, {
    productId: "42",
    imageId: "image-1",
    variantWidth: 128,
    bytes: webp(128, 96),
    contentType: "image/webp",
  }),
  "INVALID_MASTER",
);

const listed = new MemoryStore();
listed.objects.set(`${MASTER_ID}-product-image-w128.webp`, webp(128, 96));
listed.objects.set(`${MASTER_ID}-product-image-w384.webp`, webp(384, 200));
assert.deepEqual(
  await confirmedVariantWidths(listed, MASTER_NAME, 2048, 1536),
  [128],
);

const calls: Array<{ bucket: string; path: string; upsert: boolean }> = [];
const adapter = createProductImageVariantStore({
  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, _body: Blob, options: { upsert: boolean }) {
          calls.push({ bucket, path, upsert: options.upsert });
          return { error: null };
        },
        async download() {
          return { data: new Blob([webp(128, 96).buffer]), error: null };
        },
      };
    },
  },
} as never);
assert.equal(await adapter.uploadNew("variant.webp", webp(128, 96)), "created");
assert.deepEqual(calls, [{ bucket: "product-images", path: "variant.webp", upsert: false }]);
assert.equal(isStorageConflict({ status: 409, statusCode: "409" }), true);
assert.equal(isStorageConflict({ status: 500, message: "The resource already exists" }), false);

const owned = createOwnedProductImageLookup({
  from() {
    return {
      select() {
        return {
          eq() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return { data: { image_url: IMAGE_URL, product_id: 42 }, error: null };
                  },
                };
              },
            };
          },
        };
      },
    };
  },
} as never);
assert.equal(await owned.findOwnedImage("42", "image-1"), IMAGE_URL);
assert.equal(await owned.findOwnedImage("7", "image-1"), null);

const raced = new MemoryStore();
raced.objects.set(MASTER_NAME, master);
const request = {
  productId: "42",
  imageId: "image-1",
  variantWidth: 768 as const,
  bytes: webp(768, 576),
  contentType: "image/webp",
};
const [first, second] = await Promise.all([
  uploadProductImageVariantRecord(lookup(IMAGE_URL), raced, quietMetadata, request),
  uploadProductImageVariantRecord(lookup(IMAGE_URL), raced, quietMetadata, request),
]);
assert.deepEqual(
  [first.outcome, second.outcome].sort(),
  ["already-stored", "created"],
);
assert.equal(raced.objects.get(`${MASTER_ID}-product-image-w768.webp`)?.byteLength, 30);

console.log(JSON.stringify({
  webpHeader: parsed,
  created: created.fileName,
  retry: again.outcome,
  parallel: [first.outcome, second.outcome],
}));
