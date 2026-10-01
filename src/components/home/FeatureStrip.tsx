"use client";

import { BadgeCheck, Truck, WalletCards } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FeatureStrip() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Truck,
      title: t.featureDeliveryTitle,
      text: t.featureDeliveryText,
    },
    {
      icon: WalletCards,
      title: t.featurePaymentTitle,
      text: t.featurePaymentText,
    },
    {
      icon: BadgeCheck,
      title: t.featureUxTitle,
      text: t.featureUxText,
    },
  ];

  return (
    <section className="border-b border-zinc-200 dark:border-white/10 dark:bg-black/30">
      <div className="container-page grid gap-4 py-6 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-orange/15 text-brand-gold">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{feature.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
