"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/orders/create-order";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizeStorefrontMessage } from "@/lib/i18n/localize-storefront-message";
import type {
  CreateOrderInput,
  FulfillmentMethod,
} from "@/lib/orders/validate-order";
import CustomerInformationForm from "./form/CustomerInformationForm";
import OrderSummary from "./summary/OrderSummary";
import {
  CheckoutCustomerFormField,
  CheckoutCustomerFormTouched,
  CheckoutCustomerFormValues,
  initialCheckoutCustomerFormValues,
} from "./form/types";
import {
  getCustomerFormErrors,
  isCustomerFormValid,
} from "./form/validate-customer-form";

export default function CheckoutPageContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { cartItems, clearCart } = useCart();

  const [values, setValues] = useState<CheckoutCustomerFormValues>(
    initialCheckoutCustomerFormValues,
  );
  const [touched, setTouched] = useState<CheckoutCustomerFormTouched>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(
    null,
  );
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(
    null,
  );

  const errors = getCustomerFormErrors(values);
  const isFormValid = isCustomerFormValid(values);
  const isCartEmpty = cartItems.length === 0;

  function handleChange(
    field: CheckoutCustomerFormField,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleBlur(field: CheckoutCustomerFormField) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }

  function handleFulfillmentChange(next: FulfillmentMethod) {
    setValues((current) => ({
      ...current,
      fulfillmentMethod: next,
      address: next === "pickup" ? "" : current.address,
    }));

    setTouched((current) => ({
      ...current,
      address: next === "pickup" ? false : current.address,
      fulfillmentMethod: true,
    }));
  }

  function handleSubmitAttempt() {
    setSubmitAttempted(true);
  }

  async function handlePlaceOrder() {
    setSubmitAttempted(true);

    if (
      !isFormValid ||
      isCartEmpty ||
      isSubmitting ||
      createdOrderId
    ) {
      return;
    }

    const isPickup = values.fulfillmentMethod === "pickup";

    const payload: CreateOrderInput = {
      customerName: values.fullName,
      customerEmail: values.email.trim() || undefined,
      customerPhone: values.phone,
      customerAddress: isPickup ? null : values.address,
      fulfillmentMethod: values.fulfillmentMethod,
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const result = await createOrder(payload);

      setCreatedOrderId(result.orderId);
      clearCart();
      router.push(`/checkout/success/${result.orderId}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      const message =
        error instanceof Error && error.message.trim()
          ? localizeStorefrontMessage(error.message, t)
          : t.orderErrorGeneric;

      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleErrors = {
    fullName:
      touched.fullName || submitAttempted
        ? errors.fullName
        : undefined,
    email:
      touched.email || submitAttempted ? errors.email : undefined,
    phone:
      touched.phone || submitAttempted ? errors.phone : undefined,
    address:
      touched.address || submitAttempted
        ? errors.address
        : undefined,
    fulfillmentMethod:
      touched.fulfillmentMethod || submitAttempted
        ? errors.fulfillmentMethod
        : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          {t.checkoutTitle}
        </h1>

        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          {t.checkoutDescription}
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <CustomerInformationForm
            values={values}
            errors={visibleErrors}
            onChange={handleChange}
            onBlur={handleBlur}
            onFulfillmentChange={handleFulfillmentChange}
            onSubmitAttempt={handleSubmitAttempt}
          />
        </div>

        <div>
          <OrderSummary
            isFormValid={isFormValid}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
            createdOrderId={createdOrderId}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>

      </div>

    </div>
  );
}
