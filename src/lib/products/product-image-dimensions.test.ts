import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { planProductImageVariants } from "./plan-product-image-variants";
import {
  masterImageSize,
  productImageVariantLayout,
  variantHeightFromMaster,
} from "./product-image-dimensions";

const MASTER_MAX_EDGE = 2048;
const here = path.dirname(fileURLToPath(import.meta.url));

function originalMasterSize(width: number, height: number) {
  const longEdge = Math.max(width, height);

  if (longEdge <= MASTER_MAX_EDGE) {
    return { width, height };
  }

  const scale = MASTER_MAX_EDGE / longEdge;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function expectedVariantHeight(
  masterWidth: number,
  masterHeight: number,
  variantWidth: number,
) {
  return Math.max(1, Math.round((masterHeight * variantWidth) / masterWidth));
}

function assertLayout(width: number, height: number, expected: Array<[number, number]>) {
  const master = masterImageSize(width, height);
  const oracle = originalMasterSize(width, height);
  assert.deepEqual(master, oracle, `master ${width}x${height}`);

  const layout = productImageVariantLayout(width, height);
  assert.deepEqual(
    layout.map((variant) => [variant.width, variant.height]),
    expected,
    `layout ${width}x${height}`,
  );

  const plan = planProductImageVariants(width, height);
  assert.deepEqual(
    plan.create,
    expected.map(([variantWidth]) => variantWidth),
    `plan ${width}x${height}`,
  );

  for (const variant of layout) {
    assert.ok(variant.width < master.width, `upscale ${width}x${height}`);
    assert.equal(
      variant.height,
      expectedVariantHeight(master.width, master.height, variant.width),
    );
    assert.equal(
      variant.height,
      variantHeightFromMaster(master.width, master.height, variant.width),
    );
    assert.ok(variant.height <= master.height);
    assert.ok(variant.height <= MASTER_MAX_EDGE);
  }
}

assertLayout(129, 2049, [[128, 2032]]);
assertLayout(3000, 10000, [
  [128, 427],
  [384, 1281],
]);
assertLayout(2560, 2560, [
  [128, 128],
  [384, 384],
  [768, 768],
  [1280, 1280],
]);
assertLayout(4000, 3000, [
  [128, 96],
  [384, 288],
  [768, 576],
  [1280, 960],
]);
assertLayout(6000, 4000, [
  [128, 85],
  [384, 256],
  [768, 512],
  [1280, 853],
]);
assertLayout(3000, 4000, [
  [128, 171],
  [384, 512],
  [768, 1024],
  [1280, 1707],
]);
assertLayout(1920, 1080, [
  [128, 72],
  [384, 216],
  [768, 432],
  [1280, 720],
]);
assertLayout(1080, 1920, [
  [128, 228],
  [384, 683],
  [768, 1365],
]);

assertLayout(1, 1, []);
assertLayout(100, 80, []);
assertLayout(128, 128, []);
assertLayout(200, 100, [[128, 64]]);
assertLayout(2048, 1536, [
  [128, 96],
  [384, 288],
  [768, 576],
  [1280, 960],
]);
assertLayout(3, 4096, []);
assert.deepEqual(masterImageSize(3, 4096), { width: 2, height: 2048 });
assert.deepEqual(originalMasterSize(3, 4096), masterImageSize(3, 4096));
assert.deepEqual(masterImageSize(2048, 2048), { width: 2048, height: 2048 });
assert.deepEqual(masterImageSize(2049, 1000), originalMasterSize(2049, 1000));

for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
  assert.deepEqual(productImageVariantLayout(value, 100), []);
  assert.deepEqual(productImageVariantLayout(100, value), []);
  assert.deepEqual(planProductImageVariants(value, 100).create, []);
  assert.deepEqual(planProductImageVariants(value, 100).skip, [128, 384, 768, 1280]);
}

let comparedMasters = 0;
let comparedVariants = 0;

for (let width = 1; width <= 6000; width += 1) {
  for (let height = 1; height <= 6000; height += 1) {
    const master = masterImageSize(width, height);
    assert.deepEqual(master, originalMasterSize(width, height));
    comparedMasters += 1;

    for (const variant of productImageVariantLayout(width, height)) {
      assert.equal(
        variant.height,
        expectedVariantHeight(master.width, master.height, variant.width),
      );
      assert.ok(variant.width < master.width);
      assert.ok(variant.height <= master.height);
      comparedVariants += 1;
    }
  }
}

const optimizeSource = fs.readFileSync(
  path.join(here, "optimize-product-image.ts"),
  "utf8",
);
const generatorSource = fs.readFileSync(
  path.join(here, "generate-product-image-variants.ts"),
  "utf8",
);

assert.match(optimizeSource, /masterImageSize\(decoded\.width, decoded\.height\)/);
assert.doesNotMatch(optimizeSource, /function scaledSize/);
assert.match(generatorSource, /productImageVariantLayout\(decoded\.width, decoded\.height\)/);
assert.doesNotMatch(generatorSource, /sourceHeight \* targetWidth/);

console.log(
  JSON.stringify({
    comparedMasters,
    comparedVariants,
    cases: [
      "129x2049",
      "3000x10000",
      "2560x2560",
      "4000x3000",
      "6000x4000",
      "3000x4000",
      "1920x1080",
      "1080x1920",
      "small",
      "invalid",
      "rounding-boundaries",
    ],
  }),
);
