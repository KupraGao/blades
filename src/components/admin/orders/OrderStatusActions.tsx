"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelOrder } from "@/actions/orders/cancel-order";
import { returnDeliveryToStore } from "@/actions/orders/return-delivery-to-store";
import { updateOrderStatus } from "@/actions/orders/update-order-status";
import OrderFulfillmentActions from "@/components/admin/orders/OrderFulfillmentActions";
import { useLanguage } from "@/context/LanguageContext";
import {
  canCancelOrderStatus,
  canReturnDeliveryToStore,
  getExceptionalOrderStatus,
  getNextOrderStatus,
  getPreviousOrderStatus,
  type OrderStatus,
} from "@/lib/orders/order-status";

type Props = {
  orderId: string;
  currentStatus: string;
  fulfillmentMethod: string | null | undefined;
};

type PendingAction =
  | "forward"
  | "backward"
  | "exceptional"
  | "returnToStore"
  | "cancel"
  | null;

function getForwardActionLabel(
  targetStatus: OrderStatus,
  currentStatus: string,
  t: ReturnType<typeof useLanguage>["t"],
): string | null {
  if (
    targetStatus === "shipped" &&
    currentStatus === "delivery_failed"
  ) {
    return t.retryDelivery;
  }

  switch (targetStatus) {
    case "confirmed":
      return t.confirmOrder;
    case "processing":
      return t.startProcessing;
    case "shipped":
      return t.markAsShipped;
    case "ready_for_pickup":
      return t.markReadyForPickup;
    case "completed":
      return t.completeOrder;
    default:
      return null;
  }
}

function getBackwardActionLabel(
  previousStatus: OrderStatus,
  t: ReturnType<typeof useLanguage>["t"],
): string | null {
  switch (previousStatus) {
    case "pending":
      return t.backToPending;
    case "confirmed":
      return t.backToConfirmed;
    case "processing":
      return t.backToProcessing;
    default:
      return null;
  }
}

function getExceptionalActionLabel(
  targetStatus: OrderStatus,
  t: ReturnType<typeof useLanguage>["t"],
): string | null {
  if (targetStatus === "delivery_failed") {
    return t.markDeliveryFailed;
  }

  return null;
}

export default function OrderStatusActions({
  orderId,
  currentStatus,
  fulfillmentMethod,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = getNextOrderStatus(
    currentStatus,
    fulfillmentMethod,
  );
  const previousStatus = getPreviousOrderStatus(
    currentStatus,
    fulfillmentMethod,
  );
  const exceptionalStatus = getExceptionalOrderStatus(
    currentStatus,
    fulfillmentMethod,
  );
  const actionLabel = nextStatus
    ? getForwardActionLabel(nextStatus, currentStatus, t)
    : null;
  const previousLabel = previousStatus
    ? getBackwardActionLabel(previousStatus, t)
    : null;
  const exceptionalLabel = exceptionalStatus
    ? getExceptionalActionLabel(exceptionalStatus, t)
    : null;
  const canCancel = canCancelOrderStatus(
    currentStatus,
    fulfillmentMethod,
  );
  const canReturnToStore = canReturnDeliveryToStore(
    currentStatus,
    fulfillmentMethod,
  );
  const isCompleted = currentStatus === "completed";
  const isCancelled = currentStatus === "cancelled";
  const isReturnedToStore = currentStatus === "returned_to_store";
  const isUnknownStatus =
    nextStatus === null &&
    previousStatus === null &&
    exceptionalStatus === null &&
    !isCompleted &&
    !isCancelled &&
    !isReturnedToStore &&
    !canCancel &&
    !canReturnToStore;

  const isBusy = isPending;
  const hasActions = Boolean(
    (nextStatus && actionLabel) ||
      (previousStatus && previousLabel) ||
      (exceptionalStatus && exceptionalLabel) ||
      canReturnToStore ||
      canCancel,
  );

  function handleForward() {
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

  function handleBackward() {
    if (!previousStatus || isBusy) {
      return;
    }

    setError(null);
    setPendingAction("backward");

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, previousStatus);

      if (!result.success) {
        setError(result.error);
        setPendingAction(null);
        return;
      }

      setPendingAction(null);
      router.refresh();
    });
  }

  function handleExceptional() {
    if (!exceptionalStatus || isBusy) {
      return;
    }

    setError(null);
    setPendingAction("exceptional");

    startTransition(async () => {
      const result = await updateOrderStatus(
        orderId,
        exceptionalStatus,
      );

      if (!result.success) {
        setError(result.error);
        setPendingAction(null);
        return;
      }

      setPendingAction(null);
      router.refresh();
    });
  }

  function handleReturnToStore() {
    if (!canReturnToStore || isBusy) {
      return;
    }

    const confirmed = window.confirm(t.returnToStoreConfirm);

    if (!confirmed) {
      return;
    }

    setError(null);
    setPendingAction("returnToStore");

    startTransition(async () => {
      const result = await returnDeliveryToStore(orderId);

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

      <OrderFulfillmentActions
        orderId={orderId}
        currentStatus={currentStatus}
        fulfillmentMethod={fulfillmentMethod}
        disabled={isBusy}
      />

      {hasActions ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

          {nextStatus && actionLabel ? (
            <button
              type="button"
              onClick={handleForward}
              disabled={isBusy}
              className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pendingAction === "forward" && isBusy
                ? t.updating
                : actionLabel}
            </button>
          ) : null}

          {previousStatus && previousLabel ? (
            <button
              type="button"
              onClick={handleBackward}
              disabled={isBusy}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-800 px-5 py-3 font-semibold text-zinc-200 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pendingAction === "backward" && isBusy
                ? t.updating
                : previousLabel}
            </button>
          ) : null}

          {exceptionalStatus && exceptionalLabel ? (
            <button
              type="button"
              onClick={handleExceptional}
              disabled={isBusy}
              className="w-full rounded-xl border border-orange-500/40 bg-orange-500/15 px-5 py-3 font-semibold text-orange-300 transition hover:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pendingAction === "exceptional" && isBusy
                ? t.updating
                : exceptionalLabel}
            </button>
          ) : null}

          {canReturnToStore ? (
            <button
              type="button"
              onClick={handleReturnToStore}
              disabled={isBusy}
              className="w-full rounded-xl border border-lime-500/40 bg-lime-500/15 px-5 py-3 font-semibold text-lime-300 transition hover:bg-lime-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pendingAction === "returnToStore" && isBusy
                ? t.updating
                : t.returnToStore}
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

      {isReturnedToStore ? (
        <div className="mt-5 rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-4 py-3">
          <p className="text-sm font-medium text-zinc-200">
            {t.orderReturnedToStoreMessage}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
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
