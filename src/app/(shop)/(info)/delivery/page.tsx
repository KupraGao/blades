import type { Metadata } from "next";

import { DeliveryPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "Delivery & Pickup | Blades Premium Store",
  description: "Tbilisi delivery, free delivery threshold, and store pickup.",
};

export default function DeliveryPage() {
  return <DeliveryPageContent />;
}
