import type { Metadata } from "next";

import { TermsPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "Terms & Conditions | Blades Premium Store",
  description: "Terms for using the Blades storefront.",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
