// =====================================
// CHECKOUT CUSTOMER FORM
// =====================================

export type CheckoutCustomerFormValues = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
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
  };
