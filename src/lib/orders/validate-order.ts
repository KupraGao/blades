// =================================================
// ORDER TYPES
// =================================================

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerNote?: string;
  items: CreateOrderItemInput[];
};

export type ResolvedOrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
};

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
  // CUSTOMER NAME
  // =================================================

  if (!order.customerName.trim()) {
    throw new Error("მომხმარებლის სახელი აუცილებელია.");
  }

  if (order.customerName.trim().length < 2) {
    throw new Error(
      "მომხმარებლის სახელი მინიმუმ 2 სიმბოლოს უნდა შეიცავდეს.",
    );
  }

  // =================================================
  // CUSTOMER PHONE
  // =================================================

  if (!order.customerPhone.trim()) {
    throw new Error("ტელეფონის ნომერი აუცილებელია.");
  }

  if (order.customerPhone.trim().length < 9) {
    throw new Error("ტელეფონის ნომერი არასწორია.");
  }

  // =================================================
  // CUSTOMER EMAIL
  // =================================================

  if (
    order.customerEmail &&
    !isValidEmail(order.customerEmail.trim())
  ) {
    throw new Error("ელფოსტის მისამართი არასწორია.");
  }

  // =================================================
  // CUSTOMER ADDRESS
  // =================================================

  if (!order.customerAddress.trim()) {
    throw new Error("მისამართი აუცილებელია.");
  }

  if (order.customerAddress.trim().length < 5) {
    throw new Error(
      "მისამართი მინიმუმ 5 სიმბოლოს უნდა შეიცავდეს.",
    );
  }

  // =================================================
  // ORDER ITEMS
  // =================================================

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("კალათა ცარიელია.");
  }

  // =================================================
  // EACH ORDER ITEM
  // =================================================

  for (const item of order.items) {
    if (!item.productId || !item.productId.trim()) {
      throw new Error("პროდუქტის ID აუცილებელია.");
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error("პროდუქტის რაოდენობა არასწორია.");
    }
  }
}
