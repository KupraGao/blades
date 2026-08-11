"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
  CheckoutCustomerFormErrors,
  CheckoutCustomerFormField,
  CheckoutCustomerFormValues,
} from "./types";

type Props = {
  values: CheckoutCustomerFormValues;
  errors: CheckoutCustomerFormErrors;
  onChange: (field: CheckoutCustomerFormField, value: string) => void;
  onBlur: (field: CheckoutCustomerFormField) => void;
  onSubmitAttempt: () => void;
};

const inputClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white";

const errorInputClassName =
  "w-full rounded-xl border border-red-500 bg-white px-4 py-3 outline-none transition focus:border-red-500 dark:border-red-500 dark:bg-zinc-950";

export default function CustomerInformationForm({
  values,
  errors,
  onChange,
  onBlur,
  onSubmitAttempt,
}: Props) {
  const { t } = useLanguage();

  function translateError(key?: string) {
    if (!key) return undefined;
    return (t as Record<string, string>)[key] ?? key;
  }

  const fullNameError = translateError(errors.fullName);
  const emailError = translateError(errors.email);
  const phoneError = translateError(errors.phone);
  const addressError = translateError(errors.address);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          {t.customerInformation}
        </h2>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t.customerInformationDescription}
        </p>

      </div>

      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitAttempt();
        }}
        noValidate
      >

        <div>

          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium"
          >
            {t.fullName}
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder={t.placeholderFullName}
            value={values.fullName}
            onChange={(event) =>
              onChange("fullName", event.target.value)
            }
            onBlur={() => onBlur("fullName")}
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={
              fullNameError ? "fullName-error" : undefined
            }
            className={
              fullNameError ? errorInputClassName : inputClassName
            }
          />

          {fullNameError ? (
            <p
              id="fullName-error"
              className="mt-2 text-sm text-red-600"
            >
              {fullNameError}
            </p>
          ) : null}

        </div>

        <div>

          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            {t.email}
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder={t.placeholderEmail}
            value={values.email}
            onChange={(event) =>
              onChange("email", event.target.value)
            }
            onBlur={() => onBlur("email")}
            aria-invalid={Boolean(emailError)}
            aria-describedby={
              emailError ? "email-error" : undefined
            }
            className={
              emailError ? errorInputClassName : inputClassName
            }
          />

          {emailError ? (
            <p id="email-error" className="mt-2 text-sm text-red-600">
              {emailError}
            </p>
          ) : null}

        </div>

        <div>

          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium"
          >
            {t.phoneNumber}
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+995 555 12 34 56"
            value={values.phone}
            onChange={(event) =>
              onChange("phone", event.target.value)
            }
            onBlur={() => onBlur("phone")}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={
              phoneError ? "phone-error" : undefined
            }
            className={
              phoneError ? errorInputClassName : inputClassName
            }
          />

          {phoneError ? (
            <p id="phone-error" className="mt-2 text-sm text-red-600">
              {phoneError}
            </p>
          ) : null}

        </div>

        <div>

          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            {t.address}
          </label>

          <textarea
            id="address"
            name="address"
            rows={4}
            placeholder={t.placeholderAddress}
            value={values.address}
            onChange={(event) =>
              onChange("address", event.target.value)
            }
            onBlur={() => onBlur("address")}
            aria-invalid={Boolean(addressError)}
            aria-describedby={
              addressError ? "address-error" : undefined
            }
            className={
              addressError ? errorInputClassName : inputClassName
            }
          />

          {addressError ? (
            <p
              id="address-error"
              className="mt-2 text-sm text-red-600"
            >
              {addressError}
            </p>
          ) : null}

        </div>

      </form>

    </div>
  );
}
