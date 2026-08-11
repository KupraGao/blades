"use client";

import { useState } from "react";
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
  const [values, setValues] = useState<CheckoutCustomerFormValues>(
    initialCheckoutCustomerFormValues,
  );
  const [touched, setTouched] = useState<CheckoutCustomerFormTouched>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = getCustomerFormErrors(values);
  const isFormValid = isCustomerFormValid(values);

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

  function handleSubmitAttempt() {
    setSubmitAttempted(true);
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
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      {/* სათაური */}
      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          Checkout
        </h1>

        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Complete your order by filling in your information below.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* მომხმარებლის ინფორმაცია */}
        <div className="lg:col-span-2">
          <CustomerInformationForm
            values={values}
            errors={visibleErrors}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmitAttempt={handleSubmitAttempt}
          />
        </div>

        {/* შეკვეთის შეჯამება */}
        <div>
          <OrderSummary isFormValid={isFormValid} />
        </div>

      </div>

    </div>
  );
}
