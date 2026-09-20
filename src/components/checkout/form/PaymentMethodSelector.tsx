"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { PaymentMethod } from "@/lib/orders/payment-rules";
import type { FulfillmentMethod } from "@/lib/orders/validate-order";

type Props = {
  value: PaymentMethod;
  fulfillmentMethod: FulfillmentMethod;
  onChange: (value: PaymentMethod) => void;
};

export default function PaymentMethodSelector({
  value,
  fulfillmentMethod,
  onChange,
}: Props) {
  const { t } = useLanguage();
  const isPickup = fulfillmentMethod === "pickup";

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-medium">
        {t.paymentMethodLabel}
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 transition has-[:checked]:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:has-[:checked]:border-white">
          <input
            type="radio"
            name="paymentMethod"
            value="online"
            checked={value === "online"}
            onChange={() => onChange("online")}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">
            {t.paymentMethodOnline}
          </span>
        </label>

        {isPickup ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 transition has-[:checked]:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:has-[:checked]:border-white">
            <input
              type="radio"
              name="paymentMethod"
              value="pay_at_pickup"
              checked={value === "pay_at_pickup"}
              onChange={() => onChange("pay_at_pickup")}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">
              {t.paymentMethodPayAtPickup}
            </span>
          </label>
        ) : null}
      </div>

      {!isPickup ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
          {t.paymentDeliveryOnlineOnly}
        </p>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t.paymentPickupOptionsHint}
        </p>
      )}
    </fieldset>
  );
}
