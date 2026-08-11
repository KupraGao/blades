import Link from "next/link";
import { ReactNode } from "react";
import { getSingleOrder } from "@/actions/orders/get-single-order";
import OrderStatusActions from "@/components/admin/orders/OrderStatusActions";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";

type OrderItem = {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function InfoRow({
  label,
  children,
  isLast = false,
}: {
  label: string;
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${
        isLast ? "" : "border-b border-zinc-800"
      }`}
    >
      <span className="shrink-0 text-sm text-zinc-400">
        {label}
      </span>
      <div className="min-w-0 sm:max-w-[70%] sm:text-right">
        {children}
      </div>
    </div>
  );
}

export default async function AdminOrderDetailsPage({
  params,
}: Props) {
  const { id } = await params;
  const order = await getSingleOrder(id);

  if (!order) {
    return (
      <div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Order not found
        </h1>

        <p className="mt-2 text-zinc-400">
          We could not find an order with this reference.
        </p>

        <Link
          href="/admin/orders"
          className="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          ← Back to Orders
        </Link>

      </div>
    );
  }

  const items = (order.order_items ?? []) as OrderItem[];
  const currentStatus = String(order.status ?? "");

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* PAGE TOP */}
      <div className="flex flex-wrap items-start justify-between gap-4">

        <div className="min-w-0">

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Order Details
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Review customer details, items, and order management actions.
          </p>

        </div>

        <Link
          href="/admin/orders"
          className="shrink-0 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          ← Back to Orders
        </Link>

      </div>

      {/* ORDER HEADER */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

        <h2 className="text-lg font-semibold text-white">
          Order Header
        </h2>

        <div className="mt-4">

          <InfoRow label="Order ID">
            <p className="break-all text-sm font-semibold text-white">
              {order.id}
            </p>
          </InfoRow>

          <InfoRow label="Created">
            <p className="text-sm font-semibold text-white">
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : "—"}
            </p>
          </InfoRow>

          <InfoRow label="Total">
            <p className="text-base font-bold tabular-nums text-white">
              ₾{order.total_price}
            </p>
          </InfoRow>

          <InfoRow label="Status" isLast>
            <div className="sm:flex sm:justify-end">
              <OrderStatusBadge status={currentStatus} />
            </div>
          </InfoRow>

        </div>

      </section>

      {/* ORDER MANAGEMENT */}
      <OrderStatusActions
        orderId={order.id}
        currentStatus={currentStatus}
      />

      {/* CUSTOMER */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

        <h2 className="text-lg font-semibold text-white">
          Customer Information
        </h2>

        <div className="mt-4">

          <InfoRow label="Name">
            <p className="break-words text-sm font-semibold text-white">
              {order.customer_name}
            </p>
          </InfoRow>

          <InfoRow label="Phone">
            <p className="break-words text-sm font-semibold text-white">
              {order.customer_phone}
            </p>
          </InfoRow>

          <InfoRow label="Email">
            <p className="break-all text-sm font-semibold text-white">
              {order.customer_email || "—"}
            </p>
          </InfoRow>

          <InfoRow
            label="Address"
            isLast={!order.customer_note}
          >
            <p className="break-words text-sm font-semibold text-white">
              {order.customer_address}
            </p>
          </InfoRow>

          {order.customer_note ? (
            <InfoRow label="Customer Note" isLast>
              <p className="break-words text-sm font-semibold text-white">
                {order.customer_note}
              </p>
            </InfoRow>
          ) : null}

        </div>

      </section>

      {/* ITEMS */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

        <h2 className="text-lg font-semibold text-white">
          Order Items
        </h2>

        <div className="mt-4">

          {items.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No items found for this order.
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 py-4 ${
                  index === items.length - 1
                    ? ""
                    : "border-b border-zinc-800"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-white">
                    {item.product_title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    ₾{item.product_price} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-white">
                  ₾{item.product_price * item.quantity}
                </span>
              </div>
            ))
          )}

        </div>

        <div className="mt-1 flex items-center justify-between gap-4 border-t border-zinc-800 pt-4">
          <span className="text-base font-semibold text-white">
            Order Total
          </span>
          <span className="text-lg font-bold tabular-nums text-white">
            ₾{order.total_price}
          </span>
        </div>

      </section>

    </div>
  );
}
