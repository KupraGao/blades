import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-gold/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-orange-950 p-8 shadow-premium sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="small-label">limited offer</p>
            <h2 className="mt-3 font-serif text-3xl font-black text-white sm:text-5xl">
              შექმნილი როგორც რეალური ონლაინ მაღაზიის საწყისი პლატფორმა
            </h2>
            <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
              შემდეგ ეტაპზე დავამატებთ product details გვერდს, cart ლოგიკას, checkout flow-ს და backend-ს.
            </p>
            <a href="#" className="btn-primary mt-8 gap-2">
              შემდეგი ეტაპი <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
