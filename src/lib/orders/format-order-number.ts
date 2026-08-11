export function formatOrderNumber(
  orderNumber: number | string | null | undefined,
): string {
  if (orderNumber === null || orderNumber === undefined || orderNumber === "") {
    return "—";
  }

  return `#${orderNumber}`;
}
