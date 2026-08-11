// =================================================
// ORDER STATUS
// =================================================

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus | null
> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "completed",
  completed: null,
  cancelled: null,
};

const CANCELLABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
];

const ORDER_STATUS_ACTION_LABELS: Record<
  Exclude<OrderStatus, "pending" | "cancelled">,
  string
> = {
  confirmed: "Confirm Order",
  processing: "Start Processing",
  shipped: "Mark as Shipped",
  completed: "Complete Order",
};

// =================================================
// HELPERS
// =================================================

export function isOrderStatus(
  value: string,
): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function getOrderStatusLabel(status: string): string {
  if (isOrderStatus(status)) {
    return ORDER_STATUS_LABELS[status];
  }

  return status;
}

export function getNextOrderStatus(
  currentStatus: string,
): OrderStatus | null {
  if (!isOrderStatus(currentStatus)) {
    return null;
  }

  return ORDER_STATUS_TRANSITIONS[currentStatus];
}

export function canTransitionOrderStatus(
  currentStatus: string,
  targetStatus: string,
): boolean {
  if (!isOrderStatus(currentStatus) || !isOrderStatus(targetStatus)) {
    return false;
  }

  return ORDER_STATUS_TRANSITIONS[currentStatus] === targetStatus;
}

export function canCancelOrderStatus(status: string): boolean {
  return (CANCELLABLE_ORDER_STATUSES as readonly string[]).includes(
    status,
  );
}

export function getOrderStatusActionLabel(
  targetStatus: OrderStatus,
): string | null {
  if (targetStatus === "pending" || targetStatus === "cancelled") {
    return null;
  }

  return ORDER_STATUS_ACTION_LABELS[targetStatus];
}
