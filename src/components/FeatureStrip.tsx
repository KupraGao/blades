import { BadgeCheck, Truck, WalletCards } from "lucide-react";

const features = [
  { icon: Truck, title: "სწრაფი მიწოდება", text: "თბილისი და რეგიონები" },
  { icon: WalletCards, title: "გადახდის სისტემა", text: "შემდეგ ეტაპზე ინტეგრაცია" },
  { icon: BadgeCheck, title: "პრემიუმ UX", text: "სუფთა კატალოგი და პროდუქტი" },
];

export function FeatureStrip() {
  return (
    <section className="border-b border-white/10 bg-black/30">
      <div className="container-page grid gap-4 py-6 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div key={feature.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-orange/15 text-brand-gold">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white">{feature.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{feature.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
