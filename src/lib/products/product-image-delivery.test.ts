import assert from "node:assert/strict";

import { productImageDelivery } from "./product-image-delivery";

const MASTER_ID = "57bf30fc-2d23-4c93-9960-939aa6a5c0c9";
const MASTER_NAME = `${MASTER_ID}-product-image.webp`;
const MASTER_URL =
  `https://example.supabase.co/storage/v1/object/public/product-images/${MASTER_NAME}?token=secret`;

function variantUrl(width: number) {
  return `https://example.supabase.co/storage/v1/object/public/product-images/${MASTER_ID}-product-image-w${width}.webp`;
}

const masterOnly = productImageDelivery(MASTER_URL, undefined);
assert.equal(masterOnly.src, MASTER_URL);
assert.equal(masterOnly.srcSet, undefined);

const empty = productImageDelivery(MASTER_URL, []);
assert.equal(empty.srcSet, undefined);

const confirmed = productImageDelivery(MASTER_URL, [768, 128, 768, 2048, 64]);
assert.equal(confirmed.src, MASTER_URL);
assert.equal(
  confirmed.srcSet,
  `${variantUrl(128)} 128w, ${variantUrl(768)} 768w`,
);
assert.equal(confirmed.srcSet?.includes("token"), false);
assert.equal(confirmed.srcSet?.includes(MASTER_NAME), false);

const zoom = productImageDelivery(MASTER_URL, [128, 384, 768, 1280], { zoom: true });
assert.equal(zoom.src, MASTER_URL);
assert.equal(zoom.srcSet, undefined);

const legacy = productImageDelivery(
  "https://example.supabase.co/storage/v1/object/public/product-images/photo.jpg",
  [128, 384],
);
assert.equal(legacy.srcSet, undefined);

const otherBucket = productImageDelivery(
  `https://example.supabase.co/storage/v1/object/public/other/${MASTER_NAME}`,
  [128],
);
assert.equal(otherBucket.srcSet, undefined);

console.log(JSON.stringify({
  confirmed: confirmed.srcSet,
  zoom: zoom.srcSet ?? null,
}));
