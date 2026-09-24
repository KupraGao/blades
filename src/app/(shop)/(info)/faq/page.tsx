import type { Metadata } from "next";

import { FaqPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "FAQ | Blades Premium Store",
  description: "Common questions about ordering, delivery, pickup, and payment.",
};

export default function FaqPage() {
  return <FaqPageContent />;
}
