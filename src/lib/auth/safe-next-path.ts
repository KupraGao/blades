// =================================================
// SAFE INTERNAL REDIRECT PATH
// =================================================
// Prevents open redirects. Only same-origin relative
// paths starting with "/" (not "//") are allowed.
// =================================================

export function safeNextPath(
  next: string | null | undefined,
  fallback = "/account",
): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return fallback;
  }

  return trimmed;
}
