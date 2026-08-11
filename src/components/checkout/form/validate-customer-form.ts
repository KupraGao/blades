import {
  CheckoutCustomerFormErrors,
  CheckoutCustomerFormField,
  CheckoutCustomerFormValues,
} from "./types";

// =====================================
// EMAIL VALIDATION
// =====================================

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================
// FIELD VALIDATION
// =====================================

export function getCustomerFieldError(
  field: CheckoutCustomerFormField,
  values: CheckoutCustomerFormValues,
): string | undefined {
  const value = values[field].trim();

  switch (field) {
    case "fullName":
      if (!value) return "Full name is required.";
      if (value.length < 2) {
        return "Full name must be at least 2 characters.";
      }
      return undefined;

    case "email":
      if (!value) return "Email is required.";
      if (!isValidEmail(value)) {
        return "Enter a valid email address.";
      }
      return undefined;

    case "phone":
      if (!value) return "Phone number is required.";
      if (value.length < 9) {
        return "Phone number must be at least 9 characters.";
      }
      return undefined;

    case "address":
      if (!value) return "Address is required.";
      if (value.length < 5) {
        return "Address must be at least 5 characters.";
      }
      return undefined;

    default:
      return undefined;
  }
}

// =====================================
// FORM VALIDATION
// =====================================

export function getCustomerFormErrors(
  values: CheckoutCustomerFormValues,
): CheckoutCustomerFormErrors {
  const fields: CheckoutCustomerFormField[] = [
    "fullName",
    "email",
    "phone",
    "address",
  ];

  const errors: CheckoutCustomerFormErrors = {};

  for (const field of fields) {
    const error = getCustomerFieldError(field, values);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function isCustomerFormValid(
  values: CheckoutCustomerFormValues,
): boolean {
  return Object.keys(getCustomerFormErrors(values)).length === 0;
}
