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
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      {/* სათაური */}
      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          Customer Information
        </h2>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Please enter your billing and contact information.
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

        {/* სრული სახელი */}
        <div>

          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium"
          >
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={values.fullName}
            onChange={(event) =>
              onChange("fullName", event.target.value)
            }
            onBlur={() => onBlur("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName ? "fullName-error" : undefined
            }
            className={
              errors.fullName ? errorInputClassName : inputClassName
            }
          />

          {errors.fullName ? (
            <p
              id="fullName-error"
              className="mt-2 text-sm text-red-600"
            >
              {errors.fullName}
            </p>
          ) : null}

        </div>

        {/* ელ-ფოსტა */}
        <div>

          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={values.email}
            onChange={(event) =>
              onChange("email", event.target.value)
            }
            onBlur={() => onBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "email-error" : undefined
            }
            className={
              errors.email ? errorInputClassName : inputClassName
            }
          />

          {errors.email ? (
            <p id="email-error" className="mt-2 text-sm text-red-600">
              {errors.email}
            </p>
          ) : null}

        </div>

        {/* ტელეფონი */}
        <div>

          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium"
          >
            Phone Number
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
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "phone-error" : undefined
            }
            className={
              errors.phone ? errorInputClassName : inputClassName
            }
          />

          {errors.phone ? (
            <p id="phone-error" className="mt-2 text-sm text-red-600">
              {errors.phone}
            </p>
          ) : null}

        </div>

        {/* მისამართი */}
        <div>

          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            Address
          </label>

          <textarea
            id="address"
            name="address"
            rows={4}
            placeholder="Street, City..."
            value={values.address}
            onChange={(event) =>
              onChange("address", event.target.value)
            }
            onBlur={() => onBlur("address")}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={
              errors.address ? "address-error" : undefined
            }
            className={
              errors.address ? errorInputClassName : inputClassName
            }
          />

          {errors.address ? (
            <p
              id="address-error"
              className="mt-2 text-sm text-red-600"
            >
              {errors.address}
            </p>
          ) : null}

        </div>

      </form>

    </div>
  );
}
