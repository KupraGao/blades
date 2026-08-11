"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelOrder } from "@/actions/orders/cancel-order";
import { updateOrderStatus } from "@/actions/orders/update-order-status";
import { useLanguage } from "@/context/LanguageContext";
import {
  canCancelOrderStatus,
  getNextOrderStatus,
  type OrderStatus,
} from "@/lib/orders/order-status";

type Props = {
  orderId: string;
  currentStatus: string;
};

type PendingAction = "forward" | "cancel" | null;

function getForwardActionLabel(
  status: OrderStatus,
  t: ReturnType<typeof useLanguage>["t"],
): string | null {
  switch (status) {
    case "confirmed":
      return t.confirmOrder;
    case "processing":
      return t.startProcessing;
    case "shipped":
      return t.markAsShipped;
    case "completed":
      return t.completeOrder;
    default:
      return null;
  }
}

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = getNextOrderStatus(currentStatus);
  const actionLabel = nextStatus
    ? getForwardActionLabel(nextStatus, t)
    : null;
  const canCancel = canCancelOrderStatus(currentStatus);
  const isCompleted = currentStatus === "completed";
  const isCancelled = currentStatus === "cancelled";
  const isUnknownStatus =
    nextStatus === null && !isCompleted && !isCancelled && !canCancel;

  const isBusy = isPending;
  const hasActions = Boolean(
    (nextStatus && actionLabel) || canCancel,
  );

  function handleUpdate() {
    if (!nextStatus || isBusy) {
      return;
    }

    setError(null);
    setPendingAction("forward");

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);

      if (!result.success) {
        setError(result.error);
        setPendingAction(null);
        return;
      }

      setPendingAction(null);
      router.refresh();
    });
  }

  function handleCancel() {
    if (!canCancel || isBusy) {
      return;
    }

    const confirmed = window.confirm(t.cancelOrderConfirm);

    if (!confirmed) {
      return;
    }

    setError(null);
    setPendingAction("cancel");

    startTransition(async () => {
      const result = await cancelOrder(orderId);

      if (!result.success) {
        setError(result.error);
        setPendingAction(null);
        return;
      }

      setPendingAction(null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

      <h2 className="text-lg font-semibold text-white">
        {t.orderManagement}
      </h2>

      {hasActions ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

          {nextStatus && actionLabel ? (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isBusy}
              className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pendingAction === "forward" && isBusy
                ? t.updating
                : actionLabel}
            </button>
          ) : null}

          {canCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isBusy}
              className="w-full rounded-xl border border-red-500/40 bg-red-500/15 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pendingAction === "cancel" && isBusy
                ? t.cancelling
                : t.cancelOrder}
            </button>
          ) : null}

        </div>
      ) : null}

      {isCompleted ? (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm font-medium text-emerald-300">
            {t.orderCompletedSuccessfully}
          </p>
          <p className="mt-1 text-sm text-emerald-300/80">
            {t.noFurtherStatusActions}
          </p>
        </div>
      ) : null}

      {isCancelled ? (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm font-medium text-red-300">
            {t.orderCancelledMessage}
          </p>
          <p className="mt-1 text-sm text-red-300/80">
            {t.noFurtherStatusActions}
          </p>
        </div>
      ) : null}

      {isUnknownStatus ? (
        <p className="mt-5 text-sm text-zinc-400">
          {t.noValidStatusTransition}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

    </section>
  );
}
