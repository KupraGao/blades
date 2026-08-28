"use client";

import {
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders/order-status";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedOrderStatus } from "@/lib/i18n/localize-storefront-message";

// =================================================
// ORDER STATUS BADGE (presentation only)
// =================================================
// Shared visual language with Admin Order Details.
// No Admin actions or authorization.
// =================================================

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending:
    "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:border-amber-500/30 dark:text-amber-300",
  confirmed:
    "border-sky-500/40 bg-sky-500/15 text-sky-800 dark:border-sky-500/30 dark:text-sky-300",
  processing:
    "border-blue-500/40 bg-blue-500/15 text-blue-800 dark:border-blue-500/30 dark:text-blue-300",
  shipped:
    "border-violet-500/40 bg-violet-500/15 text-violet-800 dark:border-violet-500/30 dark:text-violet-300",
  ready_for_pickup:
    "border-cyan-500/40 bg-cyan-500/15 text-cyan-800 dark:border-cyan-500/30 dark:text-cyan-300",
  delivery_failed:
    "border-orange-500/40 bg-orange-500/15 text-orange-800 dark:border-orange-500/30 dark:text-orange-300",
  returned_to_store:
    "border-zinc-500/40 bg-zinc-500/15 text-zinc-700 dark:text-zinc-200",
  completed:
    "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-300",
  cancelled:
    "border-red-500/40 bg-red-500/15 text-red-800 dark:border-red-500/30 dark:text-red-300",
};

const FALLBACK_BADGE_CLASSES =
  "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

type Props = {
  status: string;
  className?: string;
};

export default function OrderStatusBadge({
  status,
  className = "",
}: Props) {
  const { t } = useLanguage();
  const label = getLocalizedOrderStatus(status, t);
  const badgeClasses = isOrderStatus(status)
    ? STATUS_BADGE_CLASSES[status]
    : FALLBACK_BADGE_CLASSES;

  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-lg border px-2.5 py-1 text-xs font-semibold ${badgeClasses} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
