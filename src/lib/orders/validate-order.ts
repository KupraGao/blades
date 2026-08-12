import { orderError } from "@/lib/i18n/localize-storefront-message";

// =================================================
// ORDER TYPES
// =================================================

export type FulfillmentMethod = "delivery" | "pickup";

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string | null;
  customerNote?: string;
  fulfillmentMethod: FulfillmentMethod;
  items: CreateOrderItemInput[];
};

export type ResolvedOrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
};

const FULFILLMENT_METHODS: readonly FulfillmentMethod[] = [
  "delivery",
  "pickup",
];

function isFulfillmentMethod(
  value: unknown,
): value is FulfillmentMethod {
  return (
    typeof value === "string" &&
    (FULFILLMENT_METHODS as readonly string[]).includes(value)
  );
}

// =================================================
// EMAIL VALIDATION
// =================================================

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =================================================
// CONSOLIDATE DUPLICATE PRODUCT LINES
// =================================================

export function consolidateOrderItems(
  items: CreateOrderItemInput[],
): CreateOrderItemInput[] {
  const quantities = new Map<string, number>();

  for (const item of items) {
    const productId = item.productId.trim();
    const currentQuantity = quantities.get(productId) ?? 0;
    quantities.set(productId, currentQuantity + item.quantity);
  }

  return Array.from(quantities.entries()).map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    }),
  );
}

// =================================================
// ORDER VALIDATION
// =================================================

export function validateOrder(order: CreateOrderInput) {
  // =================================================
  // FULFILLMENT METHOD
  // =================================================

  if (!isFulfillmentMethod(order.fulfillmentMethod)) {
    throw orderError("orderErrorFulfillmentInvalid");
  }

  // =================================================
  // CUSTOMER NAME
  // =================================================

  if (!order.customerName.trim()) {
    throw orderError("orderErrorCustomerNameRequired");
  }

  if (order.customerName.trim().length < 2) {
    throw orderError("orderErrorCustomerNameMin");
  }

  // =================================================
  // CUSTOMER PHONE
  // =================================================

  if (!order.customerPhone.trim()) {
    throw orderError("orderErrorPhoneRequired");
  }

  if (order.customerPhone.trim().length < 9) {
    throw orderError("orderErrorPhoneInvalid");
  }

  // =================================================
  // CUSTOMER EMAIL
  // =================================================

  if (
    order.customerEmail &&
    !isValidEmail(order.customerEmail.trim())
  ) {
    throw orderError("orderErrorEmailInvalid");
  }

  // =================================================
  // CUSTOMER ADDRESS (Delivery only)
  // =================================================

  if (order.fulfillmentMethod === "delivery") {
    const address = order.customerAddress?.trim() ?? "";

    if (!address) {
      throw orderError("orderErrorAddressRequired");
    }

    if (address.length < 5) {
      throw orderError("orderErrorAddressMin");
    }
  }

  // =================================================
  // ORDER ITEMS
  // =================================================

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw orderError("orderErrorCartEmpty");
  }

  // =================================================
  // EACH ORDER ITEM
  // =================================================

  for (const item of order.items) {
    if (!item.productId || !item.productId.trim()) {
      throw orderError("orderErrorProductIdRequired");
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw orderError("orderErrorQuantityInvalid");
    }
  }
}
