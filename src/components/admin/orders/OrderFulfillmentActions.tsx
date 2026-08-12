"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateOrderFulfillment } from "@/actions/orders/update-order-fulfillment";
import { useLanguage } from "@/context/LanguageContext";
import {
  canChangeOrderFulfillment,
  isOrderFulfillmentMethod,
} from "@/lib/orders/order-status";

type Props = {
  orderId: string;
  currentStatus: string;
  fulfillmentMethod: string | null | undefined;
  disabled?: boolean;
};

export default function OrderFulfillmentActions({
  orderId,
  currentStatus,
  fulfillmentMethod,
  disabled = false,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [address, setAddress] = useState("");

  const canEdit = canChangeOrderFulfillment(currentStatus);
  const isDelivery = fulfillmentMethod === "delivery";
  const isPickup = fulfillmentMethod === "pickup";
  const hasValidFulfillment = isOrderFulfillmentMethod(fulfillmentMethod);
  const isBusy = isPending || disabled;

  const currentLabel = isPickup
    ? t.fulfillmentPickup
    : isDelivery
      ? t.fulfillmentDelivery
      : "—";

  if (!canEdit || !hasValidFulfillment) {
    return null;
  }

  function handleSwitchToPickup() {
    if (isBusy || !isDelivery) {
      return;
    }

    const confirmed = window.confirm(t.fulfillmentAddressWillBeRemoved);

    if (!confirmed) {
      return;
    }

    setError(null);
    setShowDeliveryForm(false);

    startTransition(async () => {
      const result = await updateOrderFulfillment(orderId, "pickup");

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleOpenDeliveryForm() {
    if (isBusy || !isPickup) {
      return;
    }

    setError(null);
    setAddress("");
    setShowDeliveryForm(true);
  }

  function handleCancelDeliveryForm() {
    if (isBusy) {
      return;
    }

    setShowDeliveryForm(false);
    setAddress("");
    setError(null);
  }

  function handleSaveDelivery() {
    if (isBusy || !isPickup) {
      return;
    }

    const trimmed = address.trim();

    if (!trimmed) {
      setError(t.fulfillmentAddressRequired);
      return;
    }

    if (trimmed.length < 5) {
      setError(t.fulfillmentAddressMin);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await updateOrderFulfillment(
        orderId,
        "delivery",
        trimmed,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setShowDeliveryForm(false);
      setAddress("");
      router.refresh();
    });
  }

  return (
    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <p className="text-sm font-medium text-zinc-300">
        {t.fulfillmentMethodLabel}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex max-w-full items-center rounded-lg border px-3 py-1.5 text-sm font-semibold ${
            isPickup
              ? "border-fuchsia-500/45 bg-fuchsia-500/20 text-fuchsia-200"
              : "border-teal-500/45 bg-teal-500/20 text-teal-200"
          }`}
        >
          {currentLabel}
        </span>

        {!showDeliveryForm && isDelivery ? (
          <button
            type="button"
            onClick={handleSwitchToPickup}
            disabled={isBusy}
            className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? t.updating : t.changeToPickup}
          </button>
        ) : null}

        {!showDeliveryForm && isPickup ? (
          <button
            type="button"
            onClick={handleOpenDeliveryForm}
            disabled={isBusy}
            className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.changeToDelivery}
          </button>
        ) : null}
      </div>

      {showDeliveryForm ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm text-zinc-400">
              {t.deliveryAddressLabel}
            </span>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
              disabled={isBusy}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-500 disabled:opacity-50"
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveDelivery}
              disabled={isBusy}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? t.updating : t.saveFulfillment}
            </button>
            <button
              type="button"
              onClick={handleCancelDeliveryForm}
              disabled={isBusy}
              className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
