import assert from "node:assert/strict";

import { confirmedVariantWidthsFromMetadata } from "./product-image-delivery";
import {
  createProductImageVariantMetadataWriter,
  mergeConfirmedVariantWidth,
  removeConfirmedVariantWidth,
} from "./product-image-variant-metadata";
import { ProductImageVariantCleanupError } from "./product-image-variant-storage";

assert.deepEqual(mergeConfirmedVariantWidth([768, 128, 768, 2048, 64], 384), [128, 384, 768]);
assert.equal(mergeConfirmedVariantWidth([128], 64), null);
assert.deepEqual(confirmedVariantWidthsFromMetadata(undefined), []);

class LockedWidths {
  widths: number[] = [128];
  pending = Promise.resolve();

  async append(width: number) {
    const previous = this.pending;
    let release = () => {};
    this.pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;

    try {
      const next = mergeConfirmedVariantWidth(this.widths, width);

      if (!next) {
        throw new Error("rejected");
      }

      await new Promise((resolve) => setTimeout(resolve, 5));
      this.widths = next;
    } finally {
      release();
    }
  }
}

const locked = new LockedWidths();
await Promise.all([locked.append(768), locked.append(384)]);
assert.deepEqual(locked.widths, [128, 384, 768]);

function rpcClient(result: { data: unknown; error: { message: string } | null }) {
  const calls: unknown[] = [];

  return {
    calls,
    client: {
      async rpc(name: string, args: unknown) {
        calls.push({ name, args });
        return result;
      },
    },
  };
}

const saved = rpcClient({ data: [128, 384], error: null });
await createProductImageVariantMetadataWriter(saved.client as never).rememberConfirmedWidth(
  "42",
  "image-1",
  384,
);
assert.deepEqual(saved.calls, [{
  name: "append_product_image_variant_width",
  args: {
    target_product_id: "42",
    target_image_id: "image-1",
    target_width: 384,
  },
}]);

const blockedWrite = rpcClient({ data: null, error: { message: "writes_blocked" } });
await assert.rejects(
  () => createProductImageVariantMetadataWriter(blockedWrite.client as never).rememberConfirmedWidth(
    "42",
    "image-1",
    384,
  ),
  (error: unknown) => error instanceof Error && error.message === "WRITES_BLOCKED",
);

const missing = rpcClient({ data: [128], error: null });
await assert.rejects(
  () => createProductImageVariantMetadataWriter(missing.client as never).rememberConfirmedWidth(
    "42",
    "image-1",
    384,
  ),
  (error: unknown) => error instanceof Error && error.message === "METADATA_FAILED",
);

const removed = rpcClient({ data: [768], error: null });
await removeConfirmedVariantWidth(removed.client as never, "42", "image-1", 128);
assert.equal(
  (removed.calls[0] as { name: string }).name,
  "remove_product_image_variant_width",
);

const stuck = rpcClient({ data: [128, 768], error: null });
await assert.rejects(
  () => removeConfirmedVariantWidth(stuck.client as never, "42", "image-1", 128),
  (error: unknown) => error instanceof ProductImageVariantCleanupError && error.code === "METADATA_FAILED",
);

console.log(JSON.stringify({ parallel: locked.widths }));
