"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/orders/order-status";

// =================================================
// ADMIN DASHBOARD DATA
// =================================================
// Privileged reads only. UI gate remains (protected)/layout.
// Sales / revenue = status === "completed" only (approved).
// Calendar month + chart days use Asia/Tbilisi (matches admin dates).
// =================================================

const ADMIN_TIME_ZONE = "Asia/Tbilisi";
const TBILISI_OFFSET = "+04:00";
const STOCK_ALERT_LIMIT = 6;
const RECENT_ORDERS_LIMIT = 5;

export type DashboardDailySales = {
  dateKey: string;
  total: number;
};

export type DashboardStatusCount = {
  status: OrderStatus;
  count: number;
};

export type DashboardStockAlertItem = {
  id: string;
  title: string;
  stock: number;
};

export type DashboardRecentOrder = {
  id: string;
  order_number: number | string | null;
  customer_name: string;
  total_price: number | string;
  status: string | null;
  fulfillment_method: string | null;
  created_at: string;
};

export type AdminDashboardData = {
  productCount: number;
  totalOrderCount: number;
  thisMonthOrderCount: number;
  thisMonthSales: number;
  salesLast30Days: DashboardDailySales[];
  statusCounts: DashboardStatusCount[];
  outOfStockCount: number;
  lowStockCount: number;
  stockAlerts: DashboardStockAlertItem[];
  recentOrders: DashboardRecentOrder[];
};

function getZonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

function toDateKey(date: Date): string {
  const { year, month, day } = getZonedParts(date);
  return `${year}-${month}-${day}`;
}

function startOfCurrentCalendarMonthIso(now = new Date()): string {
  const { year, month } = getZonedParts(now);
  return new Date(
    `${year}-${month}-01T00:00:00${TBILISI_OFFSET}`,
  ).toISOString();
}

function startOfLast30DaysWindowIso(now = new Date()): string {
  const { year, month, day } = getZonedParts(now);
  const todayNoon = new Date(
    `${year}-${month}-${day}T12:00:00${TBILISI_OFFSET}`,
  );
  const startNoon = new Date(
    todayNoon.getTime() - 29 * 24 * 60 * 60 * 1000,
  );
  const startParts = getZonedParts(startNoon);
  return new Date(
    `${startParts.year}-${startParts.month}-${startParts.day}T00:00:00${TBILISI_OFFSET}`,
  ).toISOString();
}

function buildEmptyLast30DaySeries(now = new Date()): DashboardDailySales[] {
  const { year, month, day } = getZonedParts(now);
  const todayNoon = new Date(
    `${year}-${month}-${day}T12:00:00${TBILISI_OFFSET}`,
  );
  const series: DashboardDailySales[] = [];

  for (let i = 29; i >= 0; i -= 1) {
    const point = new Date(todayNoon.getTime() - i * 24 * 60 * 60 * 1000);
    series.push({
      dateKey: toDateKey(point),
      total: 0,
    });
  }

  return series;
}

function toFiniteNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await requireAdmin();

  const supabase = createAdminClient();
  const now = new Date();
  const monthStartIso = startOfCurrentCalendarMonthIso(now);
  const chartStartIso = startOfLast30DaysWindowIso(now);

  const statusCountPromises = ORDER_STATUSES.map(async (status) => {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", status);

    if (error) {
      throw new Error(error.message);
    }

    return {
      status,
      count: count ?? 0,
    } satisfies DashboardStatusCount;
  });

  const [
    productsCountResult,
    ordersCountResult,
    thisMonthOrdersCountResult,
    thisMonthSalesResult,
    chartSalesResult,
    statusCounts,
    outOfStockCountResult,
    lowStockCountResult,
    stockAlertsResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStartIso),
    supabase
      .from("orders")
      .select("total_price")
      .eq("status", "completed")
      .gte("created_at", monthStartIso),
    supabase
      .from("orders")
      .select("created_at, total_price")
      .eq("status", "completed")
      .gte("created_at", chartStartIso),
    Promise.all(statusCountPromises),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("stock", 0),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .gte("stock", 1)
      .lte("stock", 5),
    supabase
      .from("products")
      .select("id, title, stock")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(STOCK_ALERT_LIMIT),
    supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, total_price, status, fulfillment_method, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(RECENT_ORDERS_LIMIT),
  ]);

  const queryErrors = [
    productsCountResult.error,
    ordersCountResult.error,
    thisMonthOrdersCountResult.error,
    thisMonthSalesResult.error,
    chartSalesResult.error,
    outOfStockCountResult.error,
    lowStockCountResult.error,
    stockAlertsResult.error,
    recentOrdersResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    throw new Error(queryErrors[0]!.message);
  }

  const thisMonthSales = (thisMonthSalesResult.data ?? []).reduce(
    (sum, row) => sum + toFiniteNumber(row.total_price),
    0,
  );

  const salesLast30Days = buildEmptyLast30DaySeries(now);
  const salesByDay = new Map(
    salesLast30Days.map((point) => [point.dateKey, point]),
  );

  for (const row of chartSalesResult.data ?? []) {
    const createdAt = String(row.created_at ?? "");
    if (!createdAt) continue;

    const key = toDateKey(new Date(createdAt));
    const bucket = salesByDay.get(key);
    if (!bucket) continue;

    bucket.total += toFiniteNumber(row.total_price);
  }

  const stockAlerts = (stockAlertsResult.data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? "").trim() || "—",
    stock: toFiniteNumber(row.stock),
  }));

  const recentOrders = (recentOrdersResult.data ?? []).map((row) => ({
    id: String(row.id),
    order_number: row.order_number ?? null,
    customer_name: String(row.customer_name ?? "").trim() || "—",
    total_price: row.total_price ?? 0,
    status: row.status ?? null,
    fulfillment_method: row.fulfillment_method ?? null,
    created_at: String(row.created_at ?? ""),
  }));

  return {
    productCount: productsCountResult.count ?? 0,
    totalOrderCount: ordersCountResult.count ?? 0,
    thisMonthOrderCount: thisMonthOrdersCountResult.count ?? 0,
    thisMonthSales,
    salesLast30Days,
    statusCounts,
    outOfStockCount: outOfStockCountResult.count ?? 0,
    lowStockCount: lowStockCountResult.count ?? 0,
    stockAlerts,
    recentOrders,
  };
}
