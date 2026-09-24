import type { Metadata } from "next";

import { PaymentMethodsPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "Payment Methods | Blades Premium Store",
  description: "Online payment and pay at pickup options.",
};

export default function PaymentMethodsPage() {
  return <PaymentMethodsPageContent />;
}
