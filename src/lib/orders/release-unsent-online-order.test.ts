import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  isMissingReleaseRpc,
  readReleaseUnsentOnlineOrderResult,
} from "./release-unsent-online-order";

assert.equal(readReleaseUnsentOnlineOrderResult({ result: "released" }), true);
assert.equal(
  readReleaseUnsentOnlineOrderResult({ result: "already_released" }),
  true,
);
assert.equal(readReleaseUnsentOnlineOrderResult({ result: "blocked" }), false);
assert.equal(readReleaseUnsentOnlineOrderResult(null), false);
assert.equal(isMissingReleaseRpc({ code: "PGRST202" }), true);
assert.equal(isMissingReleaseRpc({ code: "42883" }), true);
assert.equal(
  isMissingReleaseRpc({ message: "Could not find the function public.release_unsent_online_order" }),
  true,
);
assert.equal(isMissingReleaseRpc({ code: "P0001" }), false);

const sql = readFileSync(
  new URL("../../../docs/sql/release-unsent-online-order.sql", import.meta.url),
  "utf8",
);

assert.match(sql, /bog_create_order_attempted boolean NOT NULL DEFAULT false/);
assert.match(sql, /CREATE OR REPLACE FUNCTION public\.release_unsent_online_order/);
assert.match(sql, /CREATE OR REPLACE FUNCTION public\.mark_bog_create_order_attempted/);
assert.doesNotMatch(sql, /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.cancel_order/i);
assert.doesNotMatch(sql, /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.create_checkout_order/i);
assert.doesNotMatch(sql, /payment_status\s*=\s*'paid'/);
assert.match(sql, /result', 'blocked'/);
assert.match(sql, /result', 'already_released'/);
assert.match(sql, /stock = product\.stock \+ requested\.quantity/);
assert.match(sql, /bog_create_order_attempted/);
assert.match(sql, /payment_provider_order_id IS NULL/);
assert.match(sql, /payment_status = 'unpaid'/);
