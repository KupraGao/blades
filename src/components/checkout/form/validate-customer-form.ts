import {
  CheckoutCustomerFormErrors,
  CheckoutCustomerFormField,
  CheckoutCustomerFormValues,
} from "./types";
import { ka } from "@/dictionaries/ka";

type DictionaryKey = keyof typeof ka;

// =====================================
// EMAIL VALIDATION
// =====================================

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================
// FIELD VALIDATION (returns dictionary keys)
// =====================================

export function getCustomerFieldError(
  field: CheckoutCustomerFormField,
  values: CheckoutCustomerFormValues,
): DictionaryKey | undefined {
  const value = values[field].trim();

  switch (field) {
    case "fullName":
      if (!value) return "validationFullNameRequired";
      if (value.length < 2) {
        return "validationFullNameMin";
      }
      return undefined;

    case "email":
      if (!value) return "validationEmailRequired";
      if (!isValidEmail(value)) {
        return "validationEmailInvalid";
      }
      return undefined;

    case "phone":
      if (!value) return "validationPhoneRequired";
      if (value.length < 9) {
        return "validationPhoneMin";
      }
      return undefined;

    case "address":
      if (!value) return "validationAddressRequired";
      if (value.length < 5) {
        return "validationAddressMin";
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
