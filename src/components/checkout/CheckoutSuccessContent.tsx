"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { claimGuestOrder } from "@/actions/orders/claim-guest-order";
import CustomerOrderProductRow from "@/components/account/CustomerOrderProductRow";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedOrderStatus } from "@/lib/i18n/localize-storefront-message";
import { formatOrderNumber } from "@/lib/orders/format-order-number";

type OrderItem = {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  image_url?: string | null;
  product_href?: string | null;
};

type Props = {
  order: any | null;
  orderId: string;
  isAuthenticated: boolean;
  canClaim: boolean;
  isOwnedByCurrentUser: boolean;
};

export default function CheckoutSuccessContent({
  order,
  orderId,
  isAuthenticated,
  canClaim,
  isOwnedByCurrentUser,
}: Props) {
  const { t, language } = useLanguage();
  const locale = language === "ka" ? "ka-GE" : "en-US";
  const [claimStatus, setClaimStatus] = useState<
    "idle" | "success" | "error"
  >(isOwnedByCurrentUser ? "success" : "idle");
  const [isPending, startTransition] = useTransition();

  const successPath = `/checkout/success/${encodeURIComponent(orderId)}`;
  const nextQuery = `?next=${encodeURIComponent(successPath)}`;

  function handleClaim() {
    setClaimStatus("idle");

    startTransition(async () => {
      const result = await claimGuestOrder(orderId);

      if (result.success) {
        setClaimStatus("success");
        return;
      }

      setClaimStatus("error");
    });
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">{t.orderNotFound}</h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          {t.orderNotFoundDescription}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  const items = (order.order_items ?? []) as OrderItem[];
  const displayOrderNumber = formatOrderNumber(order.order_number);
  const isPickup = order.fulfillment_method === "pickup";
  const fulfillmentLabel =
    order.fulfillment_method === "pickup"
      ? t.fulfillmentPickup
      : order.fulfillment_method === "delivery"
        ? t.fulfillmentDelivery
        : "—";

  const showClaimed =
    claimStatus === "success" || isOwnedByCurrentUser;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">

      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-green-600">
          {t.orderConfirmed}
        </p>
        <h1 className="mt-2 text-4xl font-bold">
          {t.thankYouForOrder}
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          {t.orderReceivedWithNumber.replace(
            "{orderNumber}",
            displayOrderNumber,
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.orderNumberLabel}
            </span>
            <span className="text-right text-base font-semibold tabular-nums">
              {displayOrderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.statusLabel}
            </span>
            <span className="font-medium">
              {getLocalizedOrderStatus(String(order.status ?? ""), t)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.dateLabel}
            </span>
            <span className="font-medium">
              {order.created_at
                ? new Date(order.created_at).toLocaleString(locale)
                : "—"}
            </span>
          </div>
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <h2 className="text-lg font-bold">{t.customerInformation}</h2>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.fullName}
            </span>
            <span className="text-right font-medium">
              {order.customer_name}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.phoneNumber}
            </span>
            <span className="text-right font-medium">
              {order.customer_phone}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.email}
            </span>
            <span className="break-all text-right font-medium">
              {order.customer_email || "—"}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.fulfillmentMethodLabel}
            </span>
            <span className="text-right font-medium">
              {fulfillmentLabel}
            </span>
          </div>

          {!isPickup ? (
            <div className="flex items-start justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">
                {t.address}
              </span>
              <span className="max-w-[70%] text-right font-medium">
                {order.customer_address || "—"}
              </span>
            </div>
          ) : null}
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <h2 className="text-lg font-bold">{t.orderItems}</h2>

        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t.noOrderItems}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <CustomerOrderProductRow
                  href={item.product_href ?? null}
                  imageUrl={item.image_url ?? null}
                  title={item.product_title}
                  quantity={item.quantity}
                  priceLine={`₾${item.product_price} × ${item.quantity}`}
                  className="min-w-0 flex-1"
                  imageClassName="h-16 w-16 sm:h-20 sm:w-20"
                />
                <span className="shrink-0 pt-1 font-medium">
                  ₾{item.product_price * item.quantity}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <div className="flex items-center justify-between text-lg font-bold">
          <span>{t.total}</span>
          <span>₾{order.total_price}</span>
        </div>

      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-4 text-center dark:border-zinc-700 dark:bg-zinc-950">
        {!isAuthenticated ? (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.orderClaimSignInToSave}
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/account/login${nextQuery}`}
                className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
              >
                {t.accountGoToLogin}
              </Link>
              <Link
                href={`/account/register${nextQuery}`}
                className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                {t.accountGoToRegister}
              </Link>
            </div>
          </>
        ) : showClaimed ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {t.orderClaimSuccess}
            </p>
            {isOwnedByCurrentUser || claimStatus === "success" ? (
              <Link
                href={`/account/orders/${encodeURIComponent(orderId)}`}
                className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                {t.accountViewOrderDetails}
              </Link>
            ) : null}
          </div>
        ) : canClaim ? (
          <>
            <button
              type="button"
              onClick={handleClaim}
              disabled={isPending}
              className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {isPending
                ? t.orderClaimSubmitting
                : t.orderClaimSaveToAccount}
            </button>
            {claimStatus === "error" ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {t.orderClaimFailed}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          {t.continueShopping}
        </Link>
      </div>

    </div>
  );
}
