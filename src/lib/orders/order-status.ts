import type { FulfillmentMethod } from "./validate-order";

// =================================================
// ORDER STATUS
// =================================================

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DELIVERY_FORWARD: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "completed",
};

const DELIVERY_BACKWARD: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: "pending",
  processing: "confirmed",
};

const PICKUP_FORWARD: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "ready_for_pickup",
  ready_for_pickup: "completed",
};

const PICKUP_BACKWARD: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: "pending",
  processing: "confirmed",
  ready_for_pickup: "processing",
};

const ALWAYS_CANCELLABLE: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
];

const FULFILLMENT_EDITABLE_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
];

const ORDER_STATUS_ACTION_LABELS: Partial<
  Record<OrderStatus, string>
> = {
  confirmed: "Confirm Order",
  processing: "Start Processing",
  shipped: "Mark as Shipped",
  ready_for_pickup: "Mark Ready for Pickup",
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

export function isOrderFulfillmentMethod(
  value: string | null | undefined,
): value is FulfillmentMethod {
  return value === "delivery" || value === "pickup";
}

export function getOrderStatusLabel(status: string): string {
  if (isOrderStatus(status)) {
    return ORDER_STATUS_LABELS[status];
  }

  return status;
}

function getForwardMap(
  fulfillmentMethod: FulfillmentMethod,
): Partial<Record<OrderStatus, OrderStatus>> {
  return fulfillmentMethod === "pickup"
    ? PICKUP_FORWARD
    : DELIVERY_FORWARD;
}

function getBackwardMap(
  fulfillmentMethod: FulfillmentMethod,
): Partial<Record<OrderStatus, OrderStatus>> {
  return fulfillmentMethod === "pickup"
    ? PICKUP_BACKWARD
    : DELIVERY_BACKWARD;
}

export function getNextOrderStatus(
  currentStatus: string,
  fulfillmentMethod: string | null | undefined,
): OrderStatus | null {
  if (
    !isOrderStatus(currentStatus) ||
    !isOrderFulfillmentMethod(fulfillmentMethod)
  ) {
    return null;
  }

  return getForwardMap(fulfillmentMethod)[currentStatus] ?? null;
}

export function getPreviousOrderStatus(
  currentStatus: string,
  fulfillmentMethod: string | null | undefined,
): OrderStatus | null {
  if (
    !isOrderStatus(currentStatus) ||
    !isOrderFulfillmentMethod(fulfillmentMethod)
  ) {
    return null;
  }

  return getBackwardMap(fulfillmentMethod)[currentStatus] ?? null;
}

export function canTransitionOrderStatus(
  currentStatus: string,
  targetStatus: string,
  fulfillmentMethod: string | null | undefined,
): boolean {
  if (
    !isOrderStatus(currentStatus) ||
    !isOrderStatus(targetStatus) ||
    !isOrderFulfillmentMethod(fulfillmentMethod)
  ) {
    return false;
  }

  const next = getForwardMap(fulfillmentMethod)[currentStatus];
  const previous = getBackwardMap(fulfillmentMethod)[currentStatus];

  return next === targetStatus || previous === targetStatus;
}

export function canCancelOrderStatus(
  status: string,
  fulfillmentMethod?: string | null,
): boolean {
  if (!isOrderStatus(status)) {
    return false;
  }

  if ((ALWAYS_CANCELLABLE as readonly string[]).includes(status)) {
    return true;
  }

  if (status === "ready_for_pickup") {
    return fulfillmentMethod === "pickup";
  }

  return false;
}

export function canChangeOrderFulfillment(status: string): boolean {
  return (FULFILLMENT_EDITABLE_STATUSES as readonly string[]).includes(
    status,
  );
}

export function getOrderStatusActionLabel(
  targetStatus: OrderStatus,
): string | null {
  return ORDER_STATUS_ACTION_LABELS[targetStatus] ?? null;
}
