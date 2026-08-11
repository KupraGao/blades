"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelOrder } from "@/actions/orders/cancel-order";
import { updateOrderStatus } from "@/actions/orders/update-order-status";
import {
  canCancelOrderStatus,
  getNextOrderStatus,
  getOrderStatusActionLabel,
} from "@/lib/orders/order-status";

type Props = {
  orderId: string;
  currentStatus: string;
};

type PendingAction = "forward" | "cancel" | null;

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = getNextOrderStatus(currentStatus);
  const actionLabel = nextStatus
    ? getOrderStatusActionLabel(nextStatus)
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

    const confirmed = window.confirm(
      "Cancel this order? Ordered quantities will be returned to stock.",
    );

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
        Order Management
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
                ? "Updating..."
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
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          ) : null}

        </div>
      ) : null}

      {isCompleted ? (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm font-medium text-emerald-300">
            Order completed successfully.
          </p>
          <p className="mt-1 text-sm text-emerald-300/80">
            No further status actions are available.
          </p>
        </div>
      ) : null}

      {isCancelled ? (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm font-medium text-red-300">
            Order cancelled.
          </p>
          <p className="mt-1 text-sm text-red-300/80">
            No further status actions are available.
          </p>
        </div>
      ) : null}

      {isUnknownStatus ? (
        <p className="mt-5 text-sm text-zinc-400">
          No valid status transition is available for this order.
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
