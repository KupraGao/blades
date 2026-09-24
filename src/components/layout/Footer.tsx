"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";
import {
  STORE_CONTACT,
  getStoreAddressLines,
  getStoreMapsDirectionsUrl,
} from "@/lib/storefront/contact";

const footerLinkClassName =
  "inline-flex min-h-11 items-center text-left text-sm text-zinc-600 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:text-zinc-400 dark:hover:text-white dark:focus-visible:ring-offset-zinc-950";

function FooterNavList({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <ul className="mt-4 space-y-1">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={footerLinkClassName}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const { t, language } = useLanguage();
  const addressLines = getStoreAddressLines(language);
  const mapsUrl = getStoreMapsDirectionsUrl();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/50">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-8">
        <div className="text-left">
          <a
            href="/"
            aria-label={t.logoHomeAria}
            className="inline-flex w-[120px] rounded-lg bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
          >
            <Image
              src="/images/fonis-gareshe-1.png"
              alt={t.logoAlt}
              width={100}
              height={40}
              className="!h-10 !w-auto object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </a>

          <ul className="mt-4 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 w-full flex-col items-start py-1 text-left text-sm leading-6 text-zinc-600 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:text-zinc-400 dark:hover:text-white dark:focus-visible:ring-offset-zinc-950"
              >
                {addressLines.map((line) => (
                  <span key={line} className="block w-full text-left">
                    {line}
                  </span>
                ))}
              </a>
            </li>
            {STORE_CONTACT.phones.map((phone) => (
              <li key={phone.tel}>
                <a href={`tel:${phone.tel}`} className={footerLinkClassName}>
                  {phone.display}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${STORE_CONTACT.email}`}
                className={footerLinkClassName}
              >
                {STORE_CONTACT.email}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label={t.footerCustomerServiceTitle}>
          <h2 className="font-bold text-zinc-900 dark:text-white">
            {t.footerCustomerServiceTitle}
          </h2>
          <FooterNavList
            items={[
              { href: "/delivery", label: t.navDelivery },
              { href: "/returns", label: t.navReturns },
              { href: "/payment-methods", label: t.navPaymentMethods },
              { href: "/faq", label: t.navFaq },
            ]}
          />
        </nav>

        <nav aria-label={t.footerLegalTitle}>
          <h2 className="font-bold text-zinc-900 dark:text-white">
            {t.footerLegalTitle}
          </h2>
          <FooterNavList
            items={[
              { href: "/privacy", label: t.navPrivacy },
              { href: "/terms", label: t.navTerms },
            ]}
          />
        </nav>
      </div>

      <div className="border-t border-zinc-200 py-5 dark:border-white/10">
        <div className="container-page text-left text-sm text-zinc-600 dark:text-zinc-500">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
}
