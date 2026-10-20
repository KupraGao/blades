import { timingSafeEqual } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

import { isRecord } from "./http";
import {
  reconcileStoredBogPayment,
  type BogReconciliationResult,
} from "./reconcile-payment";

const ORDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const BOG_RECONCILIATION_BATCH_LIMIT = 5;
export const BOG_RECONCILIATION_COOLDOWN_MS = 15 * 60 * 1000;

export type ReconciliationCandidate = {
  id: string;
  lastObservedAt: string | null;
};

export type BogReconciliationRunSummary = {
  checked: number;
  recorded: number;
  skipped: number;
  unavailable: number;
};

export type BogReconciliationSchedulePorts = {
  listCandidates: () => Promise<ReconciliationCandidate[]>;
  reconcile: (orderId: string) => Promise<BogReconciliationResult>;
  now: () => number;
};

export function authorizeBogReconciliationRequest(
  authorizationHeader: string | null,
  secret: string | undefined,
): boolean {
  const configured = secret?.trim() ?? "";
  const provided = authorizationHeader?.trim() ?? "";

  if (!configured || !provided.startsWith("Bearer ")) {
    return false;
  }

  const expected = Buffer.from(configured);
  const actual = Buffer.from(provided.slice("Bearer ".length));

  if (expected.length === 0 || expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function isWithinReconciliationCooldown(
  lastObservedAt: string | null,
  nowMs: number,
  cooldownMs = BOG_RECONCILIATION_COOLDOWN_MS,
): boolean {
  if (!lastObservedAt) {
    return false;
  }

  const observedAt = Date.parse(lastObservedAt);

  if (!Number.isFinite(observedAt)) {
    return false;
  }

  return nowMs - observedAt < cooldownMs;
}

/**
 * Reconciles a bounded batch of pending online BOG orders.
 * Each order is passed to reconcileStoredBogPayment. This function does not
 * update payment status, cancel orders, or change stock.
 */
export async function runBogPaymentReconciliation(
  ports: BogReconciliationSchedulePorts = createDefaultSchedulePorts(),
): Promise<BogReconciliationRunSummary> {
  const candidates = await ports.listCandidates();
  const summary: BogReconciliationRunSummary = {
    checked: 0,
    recorded: 0,
    skipped: 0,
    unavailable: 0,
  };
  const nowMs = ports.now();
  const batch = candidates.slice(0, BOG_RECONCILIATION_BATCH_LIMIT);

  for (const candidate of batch) {
    if (!ORDER_UUID.test(candidate.id)) {
      summary.skipped += 1;
      continue;
    }

    if (isWithinReconciliationCooldown(candidate.lastObservedAt, nowMs)) {
      summary.skipped += 1;
      continue;
    }

    summary.checked += 1;

    try {
      const result = await ports.reconcile(candidate.id);

      if (result.outcome === "recorded") {
        summary.recorded += 1;
      } else if (result.outcome === "skipped") {
        summary.skipped += 1;
      } else {
        summary.unavailable += 1;
      }
    } catch (error) {
      console.error("BOG reconciliation run failed", {
        code:
          error instanceof Error
            ? (error.message.match(/payment:[a-z0-9_]+/)?.[0] ?? null)
            : null,
      });
      summary.unavailable += 1;
    }
  }

  return summary;
}

function readOrderId(row: unknown): string | null {
  if (!isRecord(row) || typeof row.id !== "string") {
    return null;
  }

  const id = row.id.trim();
  const providerOrderId =
    typeof row.payment_provider_order_id === "string"
      ? row.payment_provider_order_id.trim()
      : "";

  if (!ORDER_UUID.test(id) || !providerOrderId) {
    return null;
  }

  return id;
}

function readNewestObservations(rows: unknown[]): Map<string, string> {
  const newest = new Map<string, string>();

  for (const row of rows) {
    if (
      !isRecord(row) ||
      typeof row.order_id !== "string" ||
      typeof row.created_at !== "string"
    ) {
      continue;
    }

    const orderId = row.order_id.trim().toLowerCase();

    if (!newest.has(orderId)) {
      newest.set(orderId, row.created_at);
    }
  }

  return newest;
}

async function listEligibleOrders(): Promise<ReconciliationCandidate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, payment_provider_order_id")
    .eq("payment_method", "online")
    .eq("payment_status", "pending")
    .eq("payment_provider", "bog")
    .not("payment_provider_order_id", "is", null)
    .neq("payment_provider_order_id", "")
    .neq("status", "cancelled")
    .neq("status", "returned_to_store")
    .order("updated_at", { ascending: true })
    .limit(BOG_RECONCILIATION_BATCH_LIMIT);

  if (error) {
    console.error("BOG reconciliation selection failed", {
      code: error.code ?? null,
    });
    throw new Error("selection");
  }

  const ids = (Array.isArray(data) ? data : [])
    .map(readOrderId)
    .filter((id): id is string => id !== null)
    .slice(0, BOG_RECONCILIATION_BATCH_LIMIT);

  if (ids.length === 0) {
    return [];
  }

  const events = await supabase
    .from("payment_events")
    .select("order_id, created_at")
    .eq("provider", "bog")
    .in("order_id", ids)
    .order("created_at", { ascending: false });

  if (events.error) {
    console.error("BOG reconciliation observation read failed", {
      code: events.error.code ?? null,
    });
  }

  const newest = events.error
    ? new Map<string, string>()
    : readNewestObservations(Array.isArray(events.data) ? events.data : []);

  return ids.map((id) => ({
    id,
    lastObservedAt: newest.get(id.toLowerCase()) ?? null,
  }));
}

function createDefaultSchedulePorts(): BogReconciliationSchedulePorts {
  return {
    listCandidates: listEligibleOrders,
    reconcile: (orderId) => reconcileStoredBogPayment(orderId),
    now: () => Date.now(),
  };
}
