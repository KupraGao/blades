import { ka } from "@/dictionaries/ka";

type Dictionary = typeof ka;
type DictionaryKey = keyof Dictionary;

const UNKNOWN_PRODUCT = "unknown";

export function orderError(
  code: DictionaryKey,
  product?: string,
): Error {
  const template = String(ka[code] ?? "");

  if (template.includes("{product}")) {
    const label = (product ?? "").trim() || UNKNOWN_PRODUCT;
    return new Error(`${String(code)}|${label}`);
  }

  return new Error(String(code));
}

export function localizeStorefrontMessage(
  message: string,
  t: Dictionary,
): string {
  const [code, ...rest] = message.split("|");
  const template = (t as Record<string, string>)[code];

  if (!template) {
    return t.orderErrorGeneric;
  }

  if (template.includes("{product}")) {
    const product = rest.join("|").trim() || UNKNOWN_PRODUCT;
    return template.replace("{product}", product);
  }

  if (template.includes("{orderId}") && rest.length > 0) {
    return template.replace("{orderId}", rest.join("|"));
  }

  if (template.includes("{count}") && rest.length > 0) {
    return template.replace("{count}", rest.join("|"));
  }

  return template;
}

export function getLocalizedOrderStatus(
  status: string,
  t: Dictionary,
): string {
  switch (status) {
    case "pending":
      return t.statusPending;
    case "confirmed":
      return t.statusConfirmed;
    case "processing":
      return t.statusProcessing;
    case "shipped":
      return t.statusShipped;
    case "ready_for_pickup":
      return t.statusReadyForPickup;
    case "completed":
      return t.statusCompleted;
    case "cancelled":
      return t.statusCancelled;
    default:
      return status;
  }
}
