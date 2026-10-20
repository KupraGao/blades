import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  authorizeBogReconciliationRequest,
  BOG_RECONCILIATION_BATCH_LIMIT,
  BOG_RECONCILIATION_COOLDOWN_MS,
  isWithinReconciliationCooldown,
  runBogPaymentReconciliation,
  type BogReconciliationSchedulePorts,
  type ReconciliationCandidate,
} from "./reconcile-schedule";
import type { BogReconciliationResult } from "./reconcile-payment";

const ORDER_A = "550e8400-e29b-41d4-a716-446655440000";
const ORDER_B = "550e8400-e29b-41d4-a716-446655440001";
const NOW = Date.parse("2026-10-20T04:15:00.000Z");

const originalConsoleError = console.error;
console.error = () => {};

function recorded(result = "applied_paid"): BogReconciliationResult {
  return { outcome: "recorded", result, paymentStatus: "paid" };
}

function ports(
  candidates: ReconciliationCandidate[],
  reconcile: BogReconciliationSchedulePorts["reconcile"] = async () =>
    recorded(),
): { ports: BogReconciliationSchedulePorts; calls: string[] } {
  const calls: string[] = [];

  return {
    calls,
    ports: {
      listCandidates: async () => candidates,
      reconcile: async (orderId) => {
        calls.push(orderId);
        return reconcile(orderId);
      },
      now: () => NOW,
    },
  };
}

async function main(): Promise<void> {
  const secret = "cron-secret-value-16";
  assert.equal(
    authorizeBogReconciliationRequest(`Bearer ${secret}`, secret),
    true,
  );
  assert.equal(authorizeBogReconciliationRequest(null, secret), false);
  assert.equal(
    authorizeBogReconciliationRequest(`Bearer ${secret}`, undefined),
    false,
  );
  assert.equal(
    authorizeBogReconciliationRequest(`Bearer ${secret}`, "   "),
    false,
  );
  assert.equal(
    authorizeBogReconciliationRequest("Bearer wrong-secret-value", secret),
    false,
  );
  assert.equal(
    authorizeBogReconciliationRequest(secret, secret),
    false,
  );
  assert.equal(
    authorizeBogReconciliationRequest("Bearer short", "longer-configured-secret"),
    false,
  );

  assert.equal(isWithinReconciliationCooldown(null, NOW), false);
  assert.equal(
    isWithinReconciliationCooldown(
      new Date(NOW - BOG_RECONCILIATION_COOLDOWN_MS + 1).toISOString(),
      NOW,
    ),
    true,
  );
  assert.equal(
    isWithinReconciliationCooldown(
      new Date(NOW - BOG_RECONCILIATION_COOLDOWN_MS).toISOString(),
      NOW,
    ),
    false,
  );

  const fresh = ports([
    { id: ORDER_A, lastObservedAt: null },
    {
      id: ORDER_B,
      lastObservedAt: new Date(NOW - 60_000).toISOString(),
    },
  ]);
  const summary = await runBogPaymentReconciliation(fresh.ports);
  assert.deepEqual(summary, {
    checked: 1,
    recorded: 1,
    skipped: 1,
    unavailable: 0,
  });
  assert.deepEqual(fresh.calls, [ORDER_A]);
  assert.equal(JSON.stringify(summary).includes(ORDER_A), false);

  const stale = ports([
    {
      id: ORDER_B,
      lastObservedAt: new Date(NOW - BOG_RECONCILIATION_COOLDOWN_MS).toISOString(),
    },
  ]);
  await runBogPaymentReconciliation(stale.ports);
  assert.deepEqual(stale.calls, [ORDER_B]);

  const extra: ReconciliationCandidate[] = Array.from(
    { length: BOG_RECONCILIATION_BATCH_LIMIT + 2 },
    (_, index) => ({
      id: `550e8400-e29b-41d4-a716-44665544000${index}`,
      lastObservedAt: null,
    }),
  );
  const bounded = ports(extra);
  const boundedSummary = await runBogPaymentReconciliation(bounded.ports);
  assert.equal(bounded.calls.length, BOG_RECONCILIATION_BATCH_LIMIT);
  assert.equal(boundedSummary.checked, BOG_RECONCILIATION_BATCH_LIMIT);
  assert.equal(boundedSummary.recorded, BOG_RECONCILIATION_BATCH_LIMIT);

  const mixed = ports(
    [
      { id: ORDER_A, lastObservedAt: null },
      { id: "not-a-uuid", lastObservedAt: null },
      { id: ORDER_B, lastObservedAt: null },
    ],
    async (orderId) => {
      if (orderId === ORDER_A) {
        throw new Error("payment:paid_update_conflict");
      }
      return { outcome: "unavailable", result: "unavailable", paymentStatus: null };
    },
  );
  const mixedSummary = await runBogPaymentReconciliation(mixed.ports);
  assert.deepEqual(mixed.calls, [ORDER_A, ORDER_B]);
  assert.deepEqual(mixedSummary, {
    checked: 2,
    recorded: 0,
    skipped: 1,
    unavailable: 2,
  });

  const first = ports([{ id: ORDER_A, lastObservedAt: null }]);
  const second = ports([{ id: ORDER_A, lastObservedAt: null }]);
  const [left, right] = await Promise.all([
    runBogPaymentReconciliation(first.ports),
    runBogPaymentReconciliation(second.ports),
  ]);
  assert.equal(left.recorded, 1);
  assert.equal(right.recorded, 1);
  assert.deepEqual(left, right);

  const schedule = readFileSync(new URL("./reconcile-schedule.ts", import.meta.url), "utf8");
  const route = readFileSync(
    new URL("../../../app/api/cron/bog-payments/route.ts", import.meta.url),
    "utf8",
  );
  const vercel = JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
  ) as { crons: Array<{ path: string; schedule: string }> };
  const callback = readFileSync(
    new URL("../../../app/api/payments/bog/callback/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(schedule, /reconcileStoredBogPayment/);
  assert.doesNotMatch(schedule, /\.update\(/);
  assert.doesNotMatch(schedule, /payment_status\s*=\s*"paid"/);
  assert.doesNotMatch(schedule, /cancel_order/);
  assert.match(route, /authorizeBogReconciliationRequest/);
  assert.match(route, /runBogPaymentReconciliation/);
  assert.match(route, /CRON_SECRET/);
  assert.doesNotMatch(route, /export async function POST/);
  assert.equal(vercel.crons[0]?.path, "/api/cron/bog-payments");
  assert.equal(vercel.crons[0]?.schedule, "15 4 * * *");
  assert.match(callback, /processBogPaymentCallback/);
  assert.doesNotMatch(callback, /runBogPaymentReconciliation/);
}

main()
  .catch((error: unknown) => {
    console.error = originalConsoleError;
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    console.error = originalConsoleError;
  });
