export default function AdminPage() {
  return (
    <>
      <h2 className="mb-6 text-4xl font-bold text-white">
        Dashboard
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg text-zinc-400">
            Products
          </h3>

          <p className="mt-4 text-4xl font-bold text-white">
            0
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg text-zinc-400">
            Categories
          </h3>

          <p className="mt-4 text-4xl font-bold text-white">
            0
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg text-zinc-400">
            Orders
          </h3>

          <p className="mt-4 text-4xl font-bold text-white">
            0
          </p>
        </div>

      </div>
    </>
  );
}