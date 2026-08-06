export default function CustomerInformationForm() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      {/* სათაური */}
      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          Customer Information
        </h2>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Please enter your billing and contact information.
        </p>

      </div>

      <div className="grid gap-5">

        {/* სრული სახელი */}
        <div>

          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium"
          >
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />

        </div>

        {/* ელ-ფოსტა */}
        <div>

          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />

        </div>

        {/* ტელეფონი */}
        <div>

          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium"
          >
            Phone Number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+995 555 12 34 56"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />

        </div>

        {/* მისამართი */}
        <div>

          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            Address
          </label>

          <textarea
            id="address"
            name="address"
            rows={4}
            placeholder="Street, City..."
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />

        </div>

      </div>

    </div>
  );
}