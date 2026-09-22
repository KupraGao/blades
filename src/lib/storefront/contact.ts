/**
 * Canonical Blades storefront business contact data.
 * Stable values for Contact page, Footer, and future storefront UI.
 * UI labels stay in dictionaries; address display is language-aware here.
 */

export type StorefrontLanguage = "ka" | "en";

export type StorePhone = {
  display: string;
  tel: string;
};

export const STORE_CONTACT = {
  email: "bladesgeo@gmail.com",
  phones: [
    { display: "557 91 01 01", tel: "+995557910101" },
    { display: "557 19 04 58", tel: "+995557190458" },
  ] as const satisfies readonly StorePhone[],
  addressLines: {
    ka: [
      "წერეთლის N1",
      "სავაჭრო ცენტრი „პანდა“",
      "მაღაზია N26",
    ],
    en: [
      "Tsereteli N1",
      "Panda Shopping Center",
      "Shop N26",
    ],
  },
  /** English query used for Google Maps search/directions (no invented coordinates). */
  mapsQuery: "Tsereteli N1, Panda Shopping Center, Shop N26, Tbilisi",
} as const;

export function getStoreAddress(language: StorefrontLanguage): string {
  return STORE_CONTACT.addressLines[language].join(", ");
}

export function getStoreAddressLines(
  language: StorefrontLanguage,
): readonly string[] {
  return STORE_CONTACT.addressLines[language];
}

/** Safe Google Maps directions URL based on the known textual address. */
export function getStoreMapsDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    STORE_CONTACT.mapsQuery,
  )}`;
}

/**
 * Embeddable Google Maps iframe URL using the textual address query.
 * No API key / SDK / invented coordinates.
 */
export function getStoreMapsEmbedUrl(): string {
  const params = new URLSearchParams({
    q: STORE_CONTACT.mapsQuery,
    output: "embed",
    z: "16",
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}
