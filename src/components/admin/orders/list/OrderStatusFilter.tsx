"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedOrderStatus } from "@/lib/i18n/localize-storefront-message";
import { ORDER_STATUSES } from "@/lib/orders/order-status";

export default function OrderStatusFilter() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <select
      value={searchParams.get("status") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-zinc-600 lg:w-auto"
    >
      <option value="">{t.allStatuses}</option>

      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {getLocalizedOrderStatus(status, t)}
        </option>
      ))}
    </select>
  );
}
