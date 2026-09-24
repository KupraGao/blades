import type { Metadata } from "next";

import { ReturnsPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "Returns & Exchanges | Blades Premium Store",
  description:
    "Information about withdrawal and returns for distance orders.",
};

export default function ReturnsPage() {
  return <ReturnsPageContent />;
}
