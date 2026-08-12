"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { FulfillmentMethod } from "@/lib/orders/validate-order";

type Props = {
  value: FulfillmentMethod;
  onChange: (value: FulfillmentMethod) => void;
};

export default function FulfillmentMethodSelector({
  value,
  onChange,
}: Props) {
  const { t } = useLanguage();

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-medium">
        {t.fulfillmentMethodLabel}
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 transition has-[:checked]:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:has-[:checked]:border-white">
          <input
            type="radio"
            name="fulfillmentMethod"
            value="delivery"
            checked={value === "delivery"}
            onChange={() => onChange("delivery")}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">
            {t.fulfillmentDelivery}
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 transition has-[:checked]:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:has-[:checked]:border-white">
          <input
            type="radio"
            name="fulfillmentMethod"
            value="pickup"
            checked={value === "pickup"}
            onChange={() => onChange("pickup")}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">
            {t.fulfillmentPickup}
          </span>
        </label>
      </div>
    </fieldset>
  );
}
