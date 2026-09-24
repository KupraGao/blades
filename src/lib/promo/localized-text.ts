export function pickLocalizedText(
  ka: string | null | undefined,
  en: string | null | undefined,
  language: "ka" | "en",
): string | null {
  const kaText = ka?.trim() || null;
  const enText = en?.trim() || null;

  if (language === "en") {
    return enText ?? kaText;
  }

  return kaText ?? enText;
}
