"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders/order-status";

// =================================================
// TYPES
// =================================================

const ALLOWED_LIMITS = [10, 25, 50, 100] as const;

type AllowedLimit = (typeof ALLOWED_LIMITS)[number];

type GetOrdersOptions = {
  search?: string;
  status?: OrderStatus;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
};

const FULL_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// =================================================
// HELPERS
// =================================================

function normalizePage(page?: number): number {
  if (typeof page !== "number" || !Number.isFinite(page)) {
    return 1;
  }

  const value = Math.floor(page);

  return value < 1 ? 1 : value;
}

function normalizeLimit(limit?: number): AllowedLimit {
  if (
    typeof limit === "number" &&
    (ALLOWED_LIMITS as readonly number[]).includes(limit)
  ) {
    return limit as AllowedLimit;
  }

  return 10;
}

function normalizeSort(
  sort?: "newest" | "oldest",
): "newest" | "oldest" {
  return sort === "oldest" ? "oldest" : "newest";
}

function isFullUuid(value: string): boolean {
  return FULL_UUID_RE.test(value);
}

function sanitizeIlikeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/[,()]/g, "")
    .replace(/"/g, "");
}

/**
 * Exact order_number match: optional leading `#`, digits only.
 * Returns the canonical decimal string for PostgREST `eq`.
 */
function parseOrderNumberSearch(value: string): string | null {
  const raw = value.startsWith("#") ? value.slice(1) : value;

  if (!/^\d+$/.test(raw)) {
    return null;
  }

  // Keep PostgREST filter values within a safe numeric range.
  if (raw.length > 18) {
    return null;
  }

  try {
    const parsed = BigInt(raw);

    if (parsed < BigInt(0)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/** Quote a PostgREST filter value so `%digits%` / `#` stay intact inside `.or()`. */
function quoteOrFilterValue(value: string): string {
  return `"${value}"`;
}

// =================================================
// GET ORDERS
// =================================================

export async function getOrders({
  search,
  status,
  sort = "newest",
  page = 1,
  limit = 10,
}: GetOrdersOptions = {}) {
  // =================================================
  // SUPABASE
  // =================================================

  const supabase = createAdminClient();

  const safePage = normalizePage(page);
  const safeLimit = normalizeLimit(limit);
  const safeSort = normalizeSort(sort);
  const trimmedSearch = search?.trim() ?? "";

  // =================================================
  // QUERY
  // =================================================

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        product_id,
        product_title,
        product_price,
        quantity
      )
    `,
      {
        count: "exact",
      },
    );

  if (status && isOrderStatus(status)) {
    query = query.eq("status", status);
  }

  if (trimmedSearch) {
    const orParts: string[] = [];

    if (isFullUuid(trimmedSearch)) {
      orParts.push(`id.eq.${trimmedSearch}`);
    }

    const orderNumber = parseOrderNumberSearch(trimmedSearch);

    if (orderNumber) {
      orParts.push(`order_number.eq.${orderNumber}`);
    }

    // When the user typed "#10004", strip "#" for text matching so the
    // PostgREST `or` URL never carries a raw `#` fragment risk, and phone
    // substring match still works for the digits.
    const textSearchSource =
      orderNumber && trimmedSearch.startsWith("#")
        ? trimmedSearch.slice(1)
        : trimmedSearch;

    const safeSearch = sanitizeIlikeValue(textSearchSource);

    if (safeSearch) {
      const pattern = quoteOrFilterValue(`%${safeSearch}%`);

      orParts.push(`customer_name.ilike.${pattern}`);
      orParts.push(`customer_phone.ilike.${pattern}`);
      orParts.push(`customer_email.ilike.${pattern}`);
    }

    if (orParts.length > 0) {
      query = query.or(orParts.join(","));
    }
  }

  query = query.order("created_at", {
    ascending: safeSort === "oldest",
  });

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  // =================================================
  // ERROR
  // =================================================

  if (error) {
    throw new Error(error.message);
  }

  // =================================================
  // RESULT
  // =================================================

  const total = count ?? 0;

  return {
    orders: data ?? [],
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}
