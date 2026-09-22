export const ADMIN_CUSTOMERS_PAGE_SIZE = 20;

export type AdminCustomerListItem = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  joinedAt: string;
  emailConfirmed: boolean;
};

export type GetAdminCustomersResult = {
  customers: AdminCustomerListItem[];
  total: number;
  totalPages: number;
  page: number;
  failed: boolean;
};

export type AdminCustomerDetail = AdminCustomerListItem;

export type AdminCustomerOrderSummary = {
  id: string;
  orderNumber: number | string | null;
  createdAt: string;
  status: string | null;
  fulfillmentMethod: string | null;
  totalPrice: number | string;
};

export type AdminCustomerDetailResult = {
  customer: AdminCustomerDetail;
  orders: AdminCustomerOrderSummary[];
};
