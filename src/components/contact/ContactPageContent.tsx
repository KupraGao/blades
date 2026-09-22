"use client";

import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import {
  STORE_CONTACT,
  getStoreAddressLines,
  getStoreMapsDirectionsUrl,
  getStoreMapsEmbedUrl,
} from "@/lib/storefront/contact";

const inputClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-brand-gold/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500";

const linkClassName =
  "font-medium text-zinc-900 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:text-white dark:focus-visible:ring-offset-zinc-900";

const cardClassName =
  "flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7";

export function ContactPageContent() {
  const { t, language } = useLanguage();
  const addressLines = getStoreAddressLines(language);
  const mapsUrl = getStoreMapsDirectionsUrl();
  const mapsEmbedUrl = getStoreMapsEmbedUrl();
  const addressSummary = addressLines.join(" • ");

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero / intro */}
      <header className="max-w-2xl">
        <p className="small-label">{t.contact}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {t.contactPageTitle}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
          {t.contactPageDescription}
        </p>
      </header>

      {/* Info + form */}
      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
        <section
          aria-labelledby="contact-info-heading"
          className={cardClassName}
        >
          <h2
            id="contact-info-heading"
            className="font-serif text-xl font-bold text-zinc-900 dark:text-white"
          >
            {t.contactInfoTitle}
          </h2>

          <ul className="mt-6 flex flex-1 flex-col justify-between gap-6">
            <li className="flex gap-4">
              <span
                className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                aria-hidden
              >
                <MapPin size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {t.contactAddressLabel}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClassName} mt-1.5 block text-sm leading-6`}
                >
                  {addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </a>
              </div>
            </li>

            {STORE_CONTACT.phones.map((phone, index) => (
              <li key={phone.tel} className="flex gap-4">
                <span
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                  aria-hidden
                >
                  <Phone size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {index === 0
                      ? t.contactPhone1Label
                      : t.contactPhone2Label}
                  </p>
                  <a
                    href={`tel:${phone.tel}`}
                    className={`${linkClassName} mt-1.5 block text-base tracking-wide`}
                  >
                    {phone.display}
                  </a>
                </div>
              </li>
            ))}

            <li className="flex gap-4">
              <span
                className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                aria-hidden
              >
                <Mail size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {t.contactEmailLabel}
                </p>
                <a
                  href={`mailto:${STORE_CONTACT.email}`}
                  className={`${linkClassName} mt-1.5 block break-all text-sm`}
                >
                  {STORE_CONTACT.email}
                </a>
              </div>
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="contact-form-heading"
          className={cardClassName}
        >
          <h2
            id="contact-form-heading"
            className="font-serif text-xl font-bold text-zinc-900 dark:text-white"
          >
            {t.contactFormTitle}
          </h2>

          <form
            className="mt-6 flex flex-1 flex-col gap-3.5"
            onSubmit={(event) => {
              event.preventDefault();
            }}
            noValidate
          >
            <div>
              <label htmlFor="contact-full-name" className="sr-only">
                {t.contactFormFullName}
              </label>
              <input
                id="contact-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder={t.contactFormFullName}
                aria-label={t.contactFormFullName}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="sr-only">
                {t.contactFormEmail}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t.contactFormEmail}
                aria-label={t.contactFormEmail}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="sr-only">
                {t.contactFormPhone}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t.contactFormPhone}
                aria-label={t.contactFormPhone}
                className={inputClassName}
              />
            </div>

            <div className="flex flex-1 flex-col">
              <label htmlFor="contact-message" className="sr-only">
                {t.contactFormMessage}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder={t.contactFormMessage}
                aria-label={t.contactFormMessage}
                className={`${inputClassName} min-h-[8.5rem] flex-1 resize-y`}
              />
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-gold hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-brand-gold dark:focus-visible:ring-offset-zinc-900 sm:w-auto sm:min-w-[12rem]"
            >
              {t.contactFormSubmit}
            </button>
          </form>
        </section>
      </div>

      {/* Store location + map */}
      <section
        aria-labelledby="contact-store-heading"
        className="space-y-5"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="contact-store-heading"
            className="font-serif text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl"
          >
            {t.contactStoreTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {addressSummary}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
          <iframe
            title={t.contactMapIframeTitle}
            src={mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-[16rem] w-full border-0 sm:h-[20rem] lg:h-[24rem]"
          />
        </div>

        <div className="flex justify-center">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-gold hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-brand-gold dark:focus-visible:ring-offset-zinc-900"
          >
            {t.contactGetDirections}
            <ExternalLink size={16} aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
