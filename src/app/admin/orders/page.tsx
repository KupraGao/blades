import { getOrders } from "@/actions/orders/get-orders";

export default async function OrdersPage() {

  // =====================================
  // ORDERS
  // =====================================

  const orders = await getOrders();

  return (
    <div>

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-white">
          Orders
        </h1>

        <p className="mt-2 text-zinc-400">
          Manage customer orders
        </p>

      </div>

      {/* ===================================== */}
      {/* EMPTY */}
      {/* ===================================== */}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

          <h2 className="text-2xl font-bold text-white">
            No orders yet
          </h2>

          <p className="mt-2 text-zinc-400">
            Customer orders will appear here.
          </p>

        </div>
      ) : (

        /* ===================================== */
        /* TABLE */
        /* ===================================== */

        <div className="overflow-hidden rounded-2xl border border-zinc-800">

          <table className="w-full">

            <thead className="bg-zinc-900">

              <tr>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.id}
                  className="border-t border-zinc-800"
                >

                  <td className="p-4">
                    {order.customer_name}
                  </td>

                  <td className="p-4">
                    ₾{order.total_price}
                  </td>

                  <td className="p-4">
                    {order.status}
                  </td>

                  <td className="p-4">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}