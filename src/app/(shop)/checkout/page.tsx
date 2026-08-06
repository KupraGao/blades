import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      {/* სათაური */}
      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          Checkout
        </h1>

        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Complete your order by filling in your information below.
        </p>

      </div>

      <div className="grid gap-10 lg:grid-cols-3">

        {/* მომხმარებლის ინფორმაცია */}
        <section className="lg:col-span-2">

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <h2 className="mb-6 text-2xl font-semibold">
              Customer Information
            </h2>

            <form className="space-y-5">

              {/* სახელი */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

              </div>

              {/* ელ-ფოსტა */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

              </div>

              {/* ტელეფონი */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>

                <input
                  type="tel"
                  placeholder="+995 555 12 34 56"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

              </div>

              {/* მისამართი */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <textarea
                  rows={4}
                  placeholder="Street, City..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
                />

              </div>

            </form>

          </div>

        </section>

        {/* შეკვეთის შეჯამება */}
        <aside>

          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <h2 className="mb-6 text-2xl font-semibold">
              Order Summary
            </h2>

            {/* Placeholder */}
            <div className="space-y-4">

              <div className="flex items-center justify-between text-sm">

                <span className="text-zinc-500 dark:text-zinc-400">
                  Products
                </span>

                <span>
                  0
                </span>

              </div>

              <div className="flex items-center justify-between text-sm">

                <span className="text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </span>

                <span>
                  $0.00
                </span>

              </div>

              <div className="flex items-center justify-between text-sm">

                <span className="text-zinc-500 dark:text-zinc-400">
                  Shipping
                </span>

                <span>
                  Free
                </span>

              </div>

              <hr className="border-zinc-200 dark:border-zinc-800" />

              <div className="flex items-center justify-between text-lg font-bold">

                <span>
                  Total
                </span>

                <span>
                  $0.00
                </span>

              </div>

            </div>

            <button
              className="mt-8 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
            >
              Place Order
            </button>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-zinc-500 transition hover:text-black dark:hover:text-white"
            >
              ← Back to Cart
            </Link>

          </div>

        </aside>

      </div>

    </div>
  );
}