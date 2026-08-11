"use client";

import OrderLimit from "./OrderLimit";
import OrderSearch from "./OrderSearch";
import OrderSort from "./OrderSort";
import OrderStatusFilter from "./OrderStatusFilter";

export default function OrdersToolbar() {
  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
      <OrderSearch />

      <OrderStatusFilter />

      <OrderSort />

      <OrderLimit />
    </div>
  );
}
