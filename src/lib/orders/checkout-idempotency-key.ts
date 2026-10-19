import { orderError } from "@/lib/i18n/localize-storefront-message";

// Checkout submission identity. This is not the Bank of Georgia
// Idempotency-Key and it is not sent to the bank.

const CHECKOUT_IDEMPOTENCY_KEY_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const STORAGE_KEY = "blades.checkout.idempotency.v1";

export type CheckoutIdempotencyItem = {
  productId: string;
  quantity: number;
};

export type CheckoutIdempotencyIdentity = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  fulfillmentMethod: string;
  paymentMethod: string;
  items: CheckoutIdempotencyItem[];
};

export type CheckoutIdempotencyStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type StoredCheckoutAttempt = {
  v: 1;
  key: string;
  identity: string;
};

export function assertCheckoutIdempotencyKey(value: unknown): string {
  if (typeof value !== "string") {
    throw orderError("orderErrorInvalidIdempotencyKey");
  }

  const key = value.trim().toLowerCase();
  if (!CHECKOUT_IDEMPOTENCY_KEY_V4.test(key)) {
    throw orderError("orderErrorInvalidIdempotencyKey");
  }

  return key;
}

export function createCheckoutIdempotencyKey(): string {
  const generated = globalThis.crypto?.randomUUID?.();
  return assertCheckoutIdempotencyKey(generated);
}

export function canonicalCheckoutIdempotencyIdentity(
  identity: CheckoutIdempotencyIdentity,
): string {
  const quantities = new Map<string, number>();

  for (const item of identity.items) {
    const productId = item.productId.trim();
    quantities.set(
      productId,
      (quantities.get(productId) ?? 0) + item.quantity,
    );
  }

  const items = Array.from(quantities.entries())
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
    .map(([productId, quantity]) => ({ productId, quantity }));

  return JSON.stringify({
    customerName: identity.customerName.trim(),
    customerPhone: identity.customerPhone.trim(),
    customerEmail: identity.customerEmail.trim(),
    customerAddress: identity.customerAddress.trim(),
    fulfillmentMethod: identity.fulfillmentMethod,
    paymentMethod: identity.paymentMethod,
    items,
  });
}

function readStoredAttempt(
  storage: CheckoutIdempotencyStorage,
): StoredCheckoutAttempt | null {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCheckoutAttempt>;
    if (
      parsed.v !== 1 ||
      typeof parsed.key !== "string" ||
      typeof parsed.identity !== "string"
    ) {
      return null;
    }

    return {
      v: 1,
      key: parsed.key,
      identity: parsed.identity,
    };
  } catch {
    return null;
  }
}

function writeStoredAttempt(
  storage: CheckoutIdempotencyStorage,
  attempt: StoredCheckoutAttempt,
) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(attempt));
  } catch {
    // The current attempt can still proceed. Refresh reuse needs storage.
  }
}

export function resolveCheckoutIdempotencyKey(
  storage: CheckoutIdempotencyStorage,
  identity: CheckoutIdempotencyIdentity,
  createKey: () => string = createCheckoutIdempotencyKey,
): string {
  const canonical = canonicalCheckoutIdempotencyIdentity(identity);
  const stored = readStoredAttempt(storage);

  if (stored && stored.identity === canonical) {
    try {
      return assertCheckoutIdempotencyKey(stored.key);
    } catch {
      // Replace a stored value that is not a UUID v4.
    }
  }

  const key = assertCheckoutIdempotencyKey(createKey());
  writeStoredAttempt(storage, {
    v: 1,
    key,
    identity: canonical,
  });
  return key;
}

export function clearCheckoutIdempotencyAttempt(
  storage: CheckoutIdempotencyStorage,
) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // A later attempt with the same identity would reuse the key.
  }
}

export function browserCheckoutIdempotencyStorage(): CheckoutIdempotencyStorage {
  return {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => {
      sessionStorage.setItem(key, value);
    },
    removeItem: (key) => {
      sessionStorage.removeItem(key);
    },
  };
}
