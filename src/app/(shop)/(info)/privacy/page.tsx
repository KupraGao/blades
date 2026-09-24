import type { Metadata } from "next";

import { PrivacyPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "Privacy Policy | Blades Premium Store",
  description: "How Blades handles storefront account and order information.",
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
