"use client";

import Link from "next/link";

import {
  InfoPageShell,
  InfoSection,
  infoLinkClassName,
} from "@/components/info/InfoPageShell";
import { useLanguage } from "@/context/LanguageContext";
import {
  STORE_CONTACT,
  getStoreAddressLines,
  getStoreMapsDirectionsUrl,
} from "@/lib/storefront/contact";

export function AboutPageContent() {
  const { t, language } = useLanguage();
  const addressLines = getStoreAddressLines(language);
  const mapsUrl = getStoreMapsDirectionsUrl();

  return (
    <InfoPageShell title={t.aboutTitle} intro={t.aboutIntro}>
      <InfoSection title={t.aboutCatalogTitle}>
        <p>{t.aboutCatalogBody}</p>
      </InfoSection>

      <InfoSection title={t.aboutStoreTitle}>
        <p>{t.aboutStoreBody}</p>
        <p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={infoLinkClassName}
          >
            {addressLines.join(", ")}
          </a>
        </p>
        <p>
          <Link href="/contact" className={infoLinkClassName}>
            {t.contact}
          </Link>
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}

export function DeliveryPageContent() {
  const { t } = useLanguage();

  return (
    <InfoPageShell title={t.deliveryTitle} intro={t.deliveryIntro}>
      <InfoSection title={t.deliveryAreaTitle}>
        <p>{t.deliveryAreaBody}</p>
      </InfoSection>

      <InfoSection title={t.deliveryThresholdTitle}>
        <p>{t.deliveryThresholdBody}</p>
        <p>{t.deliveryFeeBody}</p>
      </InfoSection>

      <InfoSection title={t.deliveryPickupTitle}>
        <p>{t.deliveryPickupBody}</p>
      </InfoSection>

      <InfoSection title={t.deliveryCheckoutTitle}>
        <p>{t.deliveryCheckoutBody}</p>
      </InfoSection>
    </InfoPageShell>
  );
}

export function PaymentMethodsPageContent() {
  const { t } = useLanguage();

  return (
    <InfoPageShell title={t.paymentInfoTitle} intro={t.paymentInfoIntro}>
      <InfoSection title={t.paymentInfoOnlineTitle}>
        <p>{t.paymentInfoOnlineBody}</p>
      </InfoSection>

      <InfoSection title={t.paymentInfoPickupTitle}>
        <p>{t.paymentInfoPickupBody}</p>
      </InfoSection>

      <InfoSection title={t.paymentInfoDeliveryTitle}>
        <p>{t.paymentInfoDeliveryBody}</p>
      </InfoSection>

      <InfoSection title={t.paymentInfoUnavailableTitle}>
        <p>{t.paymentInfoUnavailableBody}</p>
      </InfoSection>
    </InfoPageShell>
  );
}

export function ReturnsPageContent() {
  const { t, language } = useLanguage();
  const addressLines = getStoreAddressLines(language);

  return (
    <InfoPageShell title={t.returnsTitle} intro={t.returnsIntro}>
      <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {t.infoNotLegalAdvice}
      </p>

      <InfoSection title={t.returnsRightTitle}>
        <p>{t.returnsRightBody}</p>
        <p>{t.returnsPeriodBody}</p>
      </InfoSection>

      <InfoSection title={t.returnsExceptionsTitle}>
        <p>{t.returnsExceptionsBody}</p>
      </InfoSection>

      <InfoSection title={t.returnsHowTitle}>
        <p>{t.returnsHowBody}</p>
        <ul className="list-disc space-y-1 pl-5">
          {STORE_CONTACT.phones.map((phone) => (
            <li key={phone.tel}>
              <a href={`tel:${phone.tel}`} className={infoLinkClassName}>
                {phone.display}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${STORE_CONTACT.email}`}
              className={infoLinkClassName}
            >
              {STORE_CONTACT.email}
            </a>
          </li>
          <li>{addressLines.join(", ")}</li>
        </ul>
      </InfoSection>
    </InfoPageShell>
  );
}

export function PrivacyPageContent() {
  const { t } = useLanguage();

  return (
    <InfoPageShell title={t.privacyTitle} intro={t.privacyIntro}>
      <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {t.privacyBaselineNote}
      </p>

      <InfoSection title={t.privacyDataTitle}>
        <p>{t.privacyDataBody}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t.privacyDataName}</li>
          <li>{t.privacyDataEmail}</li>
          <li>{t.privacyDataPhone}</li>
          <li>{t.privacyDataAddress}</li>
          <li>{t.privacyDataAccount}</li>
          <li>{t.privacyDataProfile}</li>
          <li>{t.privacyDataOrders}</li>
          <li>{t.privacyDataGuest}</li>
          <li>{t.privacyDataRecovery}</li>
        </ul>
        <p>{t.privacyPasswordsBody}</p>
      </InfoSection>

      <InfoSection title={t.privacyPurposeTitle}>
        <p>{t.privacyPurposeBody}</p>
      </InfoSection>

      <InfoSection title={t.privacyProvidersTitle}>
        <p>{t.privacyProvidersBody}</p>
      </InfoSection>

      <InfoSection title={t.privacySecurityTitle}>
        <p>{t.privacySecurityBody}</p>
      </InfoSection>

      <InfoSection title={t.privacyRightsTitle}>
        <p>{t.privacyRightsBody}</p>
      </InfoSection>

      <InfoSection title={t.privacyContactTitle}>
        <p>{t.privacyContactBody}</p>
        <p>
          <a
            href={`mailto:${STORE_CONTACT.email}`}
            className={infoLinkClassName}
          >
            {STORE_CONTACT.email}
          </a>
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}

export function TermsPageContent() {
  const { t } = useLanguage();

  return (
    <InfoPageShell title={t.termsTitle} intro={t.termsIntro}>
      <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {t.infoNotLegalAdvice}
      </p>

      <InfoSection title={t.termsScopeTitle}>
        <p>{t.termsScopeBody}</p>
      </InfoSection>

      <InfoSection title={t.termsIdentityTitle}>
        <p>{t.termsIdentityBody}</p>
      </InfoSection>

      <InfoSection title={t.termsProductsTitle}>
        <p>{t.termsProductsBody}</p>
      </InfoSection>

      <InfoSection title={t.termsPricesTitle}>
        <p>{t.termsPricesBody}</p>
      </InfoSection>

      <InfoSection title={t.termsOrderingTitle}>
        <p>{t.termsOrderingBody}</p>
      </InfoSection>

      <InfoSection title={t.termsPaymentTitle}>
        <p>{t.termsPaymentBody}</p>
      </InfoSection>

      <InfoSection title={t.termsDeliveryTitle}>
        <p>{t.termsDeliveryBody}</p>
      </InfoSection>

      <InfoSection title={t.termsWithdrawalTitle}>
        <p>{t.termsWithdrawalBody}</p>
      </InfoSection>

      <InfoSection title={t.termsAccountTitle}>
        <p>{t.termsAccountBody}</p>
      </InfoSection>

      <InfoSection title={t.termsLiabilityTitle}>
        <p>{t.termsLiabilityBody}</p>
      </InfoSection>

      <InfoSection title={t.termsLawTitle}>
        <p>{t.termsLawBody}</p>
      </InfoSection>

      <InfoSection title={t.termsContactTitle}>
        <p>
          {t.termsContactBody}{" "}
          <a
            href={`mailto:${STORE_CONTACT.email}`}
            className={infoLinkClassName}
          >
            {STORE_CONTACT.email}
          </a>
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}

export function FaqPageContent() {
  const { t } = useLanguage();

  const items = [
    {
      question: t.faqQOrder,
      answer: t.faqAOrder,
      href: "/#products",
      linkLabel: t.products,
    },
    {
      question: t.faqQGuest,
      answer: t.faqAGuest,
    },
    {
      question: t.faqQDelivery,
      answer: t.faqADelivery,
      href: "/delivery",
      linkLabel: t.navDelivery,
    },
    {
      question: t.faqQThreshold,
      answer: t.faqAThreshold,
      href: "/delivery",
      linkLabel: t.navDelivery,
    },
    {
      question: t.faqQPickup,
      answer: t.faqAPickup,
      href: "/delivery",
      linkLabel: t.navDelivery,
    },
    {
      question: t.faqQPayment,
      answer: t.faqAPayment,
      href: "/payment-methods",
      linkLabel: t.navPaymentMethods,
    },
    {
      question: t.faqQContact,
      answer: t.faqAContact,
      href: "/contact",
      linkLabel: t.contact,
    },
    {
      question: t.faqQReturns,
      answer: t.faqAReturns,
      href: "/returns",
      linkLabel: t.navReturns,
    },
  ];

  return (
    <InfoPageShell title={t.faqTitle} intro={t.faqIntro}>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <summary className="cursor-pointer list-inside px-4 py-3.5 text-sm font-semibold text-zinc-900 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:text-white dark:focus-visible:ring-offset-zinc-900">
              {item.question}
            </summary>
            <div className="space-y-2 px-4 pb-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              <p>{item.answer}</p>
              {item.href && item.linkLabel ? (
                <p>
                  <Link href={item.href} className={infoLinkClassName}>
                    {item.linkLabel}
                  </Link>
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </InfoPageShell>
  );
}
