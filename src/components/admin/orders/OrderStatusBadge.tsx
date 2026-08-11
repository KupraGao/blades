"use client";

import {
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders/order-status";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedOrderStatus } from "@/lib/i18n/localize-storefront-message";

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending:
    "border-amber-500/30 bg-amber-500/15 text-amber-300",
  confirmed:
    "border-sky-500/30 bg-sky-500/15 text-sky-300",
  processing:
    "border-blue-500/30 bg-blue-500/15 text-blue-300",
  shipped:
    "border-violet-500/30 bg-violet-500/15 text-violet-300",
  completed:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  cancelled:
    "border-red-500/30 bg-red-500/15 text-red-300",
};

const FALLBACK_BADGE_CLASSES =
  "border-zinc-600 bg-zinc-800 text-zinc-300";

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
