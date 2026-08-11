"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function PromoBanner() {
  const { t } = useLanguage();

  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-gradient-to-r from-white via-zinc-50 to-orange-100 p-8 shadow-premium dark:border-brand-gold/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950 sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="small-label">{t.promoLimitedOffer}</p>

            <h2 className="mt-3 font-serif text-3xl font-black text-zinc-900 dark:text-white sm:text-5xl">
              {t.promoHeadline}
            </h2>

            <p className="mt-5 text-sm leading-7 text-zinc-700 dark:text-zinc-300 sm:text-base">
              {t.promoBody}
            </p>

            <a href="#" className="btn-primary mt-8 gap-2">
              {t.promoCta} <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
