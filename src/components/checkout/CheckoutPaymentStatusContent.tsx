"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";
import { formatOrderNumber } from "@/lib/orders/format-order-number";
import type { CheckoutPaymentView } from "@/lib/orders/read-checkout-payment-status";

type Props = {
  payment: CheckoutPaymentView;
};

export default function CheckoutPaymentStatusContent({ payment }: Props) {
  const { t } = useLanguage();
  const router = useRouter();

  if (payment.state === "unavailable") {
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

  const orderNumber = formatOrderNumber(payment.orderNumber);
  const copy = {
    paid: {
      title: t.paymentReturnPaidTitle,
      body: t.paymentReturnPaidBody,
    },
    pending: {
      title: t.paymentReturnPendingTitle,
      body: t.paymentReturnPendingBody,
    },
    failed: {
      title: t.paymentReturnFailedTitle,
      body: t.paymentReturnFailedBody,
    },
    refund_pending: {
      title: t.paymentReturnRefundPendingTitle,
      body: t.paymentReturnRefundPendingBody,
    },
    refunded: {
      title: t.paymentReturnRefundedTitle,
      body: t.paymentReturnRefundedBody,
    },
  }[payment.state];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p
        className={
          payment.state === "paid"
            ? "text-sm font-medium text-green-600"
            : "text-sm font-medium text-zinc-500 dark:text-zinc-400"
        }
      >
        {t.orderNumberLabel}
      </p>
      <h1 className="mt-2 text-4xl font-bold">{copy.title}</h1>
      <p className="mt-3 text-zinc-500 dark:text-zinc-400">
        {copy.body.replace("{orderNumber}", orderNumber)}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        {payment.state !== "paid" ? (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            {t.paymentReturnCheckAgain}
          </button>
        ) : null}
        <Link
          href="/"
          className="inline-block rounded-xl border border-zinc-300 px-5 py-3 font-semibold transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t.continueShopping}
        </Link>
      </div>
    </div>
  );
}
