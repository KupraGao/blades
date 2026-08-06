import CustomerInformationForm from "./form/CustomerInformationForm";
import OrderSummary from "./summary/OrderSummary";

export default function CheckoutPageContent() {
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

      <div className="grid gap-8 lg:grid-cols-3">

        {/* მომხმარებლის ინფორმაცია */}
        <div className="lg:col-span-2">
          <CustomerInformationForm />
        </div>

        {/* შეკვეთის შეჯამება */}
        <div>
          <OrderSummary />
        </div>

      </div>

    </div>
  );
}