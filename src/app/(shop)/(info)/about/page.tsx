import type { Metadata } from "next";

import { AboutPageContent } from "@/components/info/info-page-content";

export const metadata: Metadata = {
  title: "About Us | Blades Premium Store",
  description: "About the Blades store and catalog.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
