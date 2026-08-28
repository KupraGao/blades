type AdminLanguage = "ka" | "en";

/** Fixed zone so SSR and browser agree on calendar day/time. */
const ADMIN_TIME_ZONE = "Asia/Tbilisi";

function getZonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function parseDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Deterministic date-only: KA `DD.MM.YYYY`, EN `MM/DD/YYYY`. */
export function formatAdminDate(
  value: string | Date,
  language: AdminLanguage,
): string {
  const date = parseDate(value);
  if (!date) return "—";

  const { year, month, day } = getZonedParts(date);

  if (language === "ka") {
    return `${day}.${month}.${year}`;
  }

  return `${month}/${day}/${year}`;
}

/** Deterministic date+time: KA/EN with fixed separators (SSR-safe). */
export function formatAdminDateTime(
  value: string | Date,
  language: AdminLanguage,
): string {
  const date = parseDate(value);
  if (!date) return "—";

  const { year, month, day, hour, minute, second } = getZonedParts(date);
  const datePart =
    language === "ka"
      ? `${day}.${month}.${year}`
      : `${month}/${day}/${year}`;

  return `${datePart}, ${hour}:${minute}:${second}`;
}

/** Customer-facing date+time without seconds (SSR-safe, KA/EN). */
export function formatStorefrontDateTime(
  value: string | Date,
  language: AdminLanguage,
): string {
  const date = parseDate(value);
  if (!date) return "—";

  const { year, month, day, hour, minute } = getZonedParts(date);
  const datePart =
    language === "ka"
      ? `${day}.${month}.${year}`
      : `${month}/${day}/${year}`;

  return `${datePart}, ${hour}:${minute}`;
}
