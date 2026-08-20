"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a
            href="/"
            aria-label={t.logoHomeAria}
            className="inline-flex w-[120px] rounded-lg bg-white"
          >
            <Image
              src="/images/fonis-gareshe-1.png"
              alt={t.logoAlt}
              width={100}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </a>

          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {t.footerDescription}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">
            {t.menu}
          </h3>

          <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <a
                href="#"
                className="transition hover:text-zinc-900 dark:hover:text-white"
              >
                {t.products}
              </a>
            </li>

            <li>
              <a
                href="#"
                className="transition hover:text-zinc-900 dark:hover:text-white"
              >
                {t.brands}
              </a>
            </li>

            <li>
              <a
                href="#"
                className="transition hover:text-zinc-900 dark:hover:text-white"
              >
                {t.sale}
              </a>
            </li>
          </ul>
        </div>

        <div id="contact">
          <h3 className="font-bold text-zinc-900 dark:text-white">
            {t.contact}
          </h3>

          <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>{t.locationTbilisi}</li>

            <li>
              <a
                href="mailto:info@example.ge"
                className="transition hover:text-zinc-900 dark:hover:text-white"
              >
                info@example.ge
              </a>
            </li>

            <li>
              <a
                href="tel:+995555000000"
                className="transition hover:text-zinc-900 dark:hover:text-white"
              >
                +995 555 00 00 00
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-5 dark:border-white/10">
        <div className="container-page text-sm text-zinc-600 dark:text-zinc-500">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
}
