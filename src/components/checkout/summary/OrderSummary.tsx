import Link from "next/link";

export default function OrderSummary() {
  return (
    <aside className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      {/* სათაური */}
      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          Order Summary
        </h2>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Review your order before placing it.
        </p>

      </div>

      {/* პროდუქტების სია */}
      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <span className="text-zinc-600 dark:text-zinc-400">
            Products
          </span>

          <span className="font-medium">
            0
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-zinc-600 dark:text-zinc-400">
            Subtotal
          </span>

          <span className="font-medium">
            $0.00
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-zinc-600 dark:text-zinc-400">
            Shipping
          </span>

          <span className="font-medium text-green-600">
            Free
          </span>

        </div>

      </div>

      <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

      {/* ჯამი */}
      <div className="flex items-center justify-between text-lg font-bold">

        <span>Total</span>

        <span>$0.00</span>

      </div>

      {/* შეკვეთის ღილაკი */}
      <button
        type="button"
        className="mt-8 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
      >
        Place Order
      </button>

      {/* კალათში დაბრუნება */}
      <Link
        href="/cart"
        className="mt-4 block text-center text-sm text-zinc-500 transition hover:text-black dark:hover:text-white"
      >
        ← Back to Cart
      </Link>

    </aside>
  );
}