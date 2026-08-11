"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import PlaceOrderButton from "../form/PlaceOrderButton";

type Props = {
  isFormValid: boolean;
  isSubmitting: boolean;
  submissionError: string | null;
  createdOrderId: string | null;
  onPlaceOrder: () => void;
};

export default function OrderSummary({
  isFormValid,
  isSubmitting,
  submissionError,
  createdOrderId,
  onPlaceOrder,
}: Props) {
  const { t } = useLanguage();
  const { cartItems, cartCount, cartTotal } = useCart();
  const isCartEmpty = cartItems.length === 0;
  const isPlaceOrderDisabled =
    !isFormValid || isCartEmpty || isSubmitting || Boolean(createdOrderId);

  let statusMessage = t.checkoutFormIncomplete;
  let statusClassName = "text-zinc-500 dark:text-zinc-400";

  if (createdOrderId) {
    statusMessage = t.orderCreatedSuccess.replace(
      "{orderId}",
      createdOrderId,
    );
    statusClassName = "text-green-600";
  } else if (submissionError) {
    statusMessage = submissionError;
    statusClassName = "text-red-600";
  } else if (isSubmitting) {
    statusMessage = t.orderSubmitting;
    statusClassName = "text-zinc-500 dark:text-zinc-400";
  } else if (isFormValid) {
    statusMessage = t.checkoutFormReady;
    statusClassName = "text-green-600";
  }

  return (
    <aside className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          {t.orderSummary}
        </h2>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t.orderSummaryDescription}
        </p>

      </div>

      <div className="mb-6 space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.emptyCart}
          </p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  ₾{item.price} × {item.quantity}
                </p>
              </div>

              <span className="shrink-0 font-medium">
                ₾{item.price * item.quantity}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <span className="text-zinc-600 dark:text-zinc-400">
            {t.productsCountLabel}
          </span>

          <span className="font-medium">
            {cartCount}
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-zinc-600 dark:text-zinc-400">
            {t.subtotal}
          </span>

          <span className="font-medium">
            ₾{cartTotal}
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-zinc-600 dark:text-zinc-400">
            {t.shipping}
          </span>

          <span className="font-medium text-green-600">
            {t.shippingFree}
          </span>

        </div>

      </div>

      <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

      <div className="flex items-center justify-between text-lg font-bold">

        <span>{t.total}</span>

        <span>₾{cartTotal}</span>

      </div>

      <p className={`mt-6 text-sm ${statusClassName}`}>
        {statusMessage}
      </p>

      <div className="mt-4">
        <PlaceOrderButton
          disabled={isPlaceOrderDisabled}
          isSubmitting={isSubmitting}
          onClick={onPlaceOrder}
        />
      </div>

      <Link
        href="/cart"
        className="mt-4 block text-center text-sm text-zinc-500 transition hover:text-black dark:hover:text-white"
      >
        {t.backToCart}
      </Link>

    </aside>
  );
}
