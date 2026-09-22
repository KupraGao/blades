import type { Metadata } from "next";

import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { Header } from "@/components/layout/Header";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export const metadata: Metadata = {
  title: "Contact | Blades Premium Store",
  description:
    "Contact Blades about products, orders, delivery, or visit our store.",
};

export default async function ContactPage() {
  const user = await getAuthUser();

  return (
    <>
      <Header
        categories={[]}
        accountHref={user ? "/account" : "/account/login"}
      />

      <main className="section-pad">
        <div className="container-page">
          <ContactPageContent />
        </div>
      </main>
    </>
  );
}
