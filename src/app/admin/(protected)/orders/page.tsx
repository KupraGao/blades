import { getOrders } from "@/actions/orders/get-orders";
import AdminOrdersListContent from "@/components/admin/orders/AdminOrdersListContent";
import {
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders/order-status";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
};

const ALLOWED_LIMITS = [10, 25, 50, 100] as const;

function normalizePage(value?: string): number {
  const parsed = Number(value ?? 1);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function normalizeLimit(value?: string): number {
  const parsed = Number(value ?? 10);

  if ((ALLOWED_LIMITS as readonly number[]).includes(parsed)) {
    return parsed;
  }

  return 10;
}

function normalizeSort(value?: string): "newest" | "oldest" {
  return value === "oldest" ? "oldest" : "newest";
}

function normalizeStatus(value?: string): OrderStatus | undefined {
  if (!value) {
    return undefined;
  }

  return isOrderStatus(value) ? value : undefined;
}

export default async function OrdersPage({ searchParams }: Props) {
  const {
    search,
    status,
    sort,
    page,
    limit,
  } = await searchParams;

  const normalizedSearch = search?.trim() || undefined;
  const normalizedStatus = normalizeStatus(status);
  const normalizedSort = normalizeSort(sort);
  const requestedPage = normalizePage(page);
  const pageSize = normalizeLimit(limit);
  const hasActiveFilters = Boolean(normalizedSearch || normalizedStatus);

  const queryOptions = {
    search: normalizedSearch,
    status: normalizedStatus,
    sort: normalizedSort,
    limit: pageSize,
  };

  let {
    orders,
    total,
    totalPages,
  } = await getOrders({
    ...queryOptions,
    page: requestedPage,
  });

  // Clamp out-of-range pages to the last available page when matches exist.
  let currentPage = requestedPage;

  if (total === 0) {
    currentPage = 1;
  } else if (totalPages > 0 && requestedPage > totalPages) {
    currentPage = totalPages;

    ({
      orders,
      total,
      totalPages,
    } = await getOrders({
      ...queryOptions,
      page: currentPage,
    }));
  }

  return (
    <AdminOrdersListContent
      orders={orders}
      total={total}
      totalPages={totalPages}
      page={currentPage}
      limit={pageSize}
      hasActiveFilters={hasActiveFilters}
    />
  );
}
