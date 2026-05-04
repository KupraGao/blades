import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-radial-premium">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.15),rgba(9,9,11,.95))]" />

      <div className="container-page relative grid min-h-[760px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="small-label">premium ecommerce concept</p>

          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Precision.
            <span className="block text-brand-gold">Power.</span>
            Control.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300 sm:text-lg">
            თანამედროვე, სწრაფი და კომერციულად გამართული მაღაზიის საწყისი ვერსია.
            სტრუქტურა ჰგავს რეალურ ecommerce-ს, ვიზუალი კი შეგვიძლია ეტაპობრივად გავაძლიეროთ.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#products" className="btn-primary gap-2">
              კატალოგის ნახვა <ArrowRight size={18} />
            </a>
            <a href="#categories" className="btn-outline">
              კატეგორიები
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="premium-card flex items-center gap-3 p-4">
              <ShieldCheck className="text-brand-gold" size={22} />
              <span className="text-sm font-semibold text-zinc-200">
                დაცული checkout ლოგიკისთვის მზად
              </span>
            </div>
            <div className="premium-card flex items-center gap-3 p-4">
              <Sparkles className="text-brand-gold" size={22} />
              <span className="text-sm font-semibold text-zinc-200">
                Tailwind-first design system
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-brand-orange/20 blur-3xl" />

          <div className="premium-card relative overflow-hidden rounded-[2rem] p-5">
            <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(249,115,22,.32),transparent_35%),linear-gradient(145deg,#27272a,#09090b)] p-8">
              <div className="flex h-full flex-col justify-between">
                <div className="flex justify-between">
                  <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-zinc-300">
                    New Collection
                  </span>
                  <span className="rounded-full bg-brand-gold px-4 py-2 text-xs font-black text-black">
                    2026
                  </span>
                </div>

                <div>
                  <div className="mx-auto h-72 w-28 rotate-12 rounded-full bg-gradient-to-b from-zinc-200 via-zinc-500 to-zinc-950 shadow-2xl shadow-black/70" />
                  <div className="mx-auto mt-4 h-12 w-48 rounded-full bg-gradient-to-r from-zinc-900 via-amber-900 to-zinc-950 shadow-xl shadow-black/60" />
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                    featured item
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-white">
                    Premium Product Focus
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
