import type { FulfillmentMethod } from "@/lib/orders/validate-order";
import {
  DEFAULT_PAYMENT_METHOD,
  type PaymentMethod,
} from "@/lib/orders/payment-rules";

// =====================================
// CHECKOUT CUSTOMER FORM
// =====================================

export type CheckoutCustomerFormValues = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
};

export type CheckoutCustomerFormField =
  keyof CheckoutCustomerFormValues;

export type CheckoutCustomerFormErrors = Partial<
  Record<CheckoutCustomerFormField, string>
>;

export type CheckoutCustomerFormTouched = Partial<
  Record<CheckoutCustomerFormField, boolean>
>;

export const initialCheckoutCustomerFormValues: CheckoutCustomerFormValues =
  {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    fulfillmentMethod: "delivery",
    paymentMethod: DEFAULT_PAYMENT_METHOD,
  };
