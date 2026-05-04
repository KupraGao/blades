import { categories } from "@/data/products";
import { ArrowUpRight } from "lucide-react";

export function CategorySection() {
  return (
    <section id="categories" className="section-pad">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="small-label">shop by category</p>
            <h2 className="section-title mt-3">კატეგორიები</h2>
            <p className="section-subtitle">
              საწყის ეტაპზე მონაცემები სტატიკურია. შემდეგ პროდუქტებს, კატეგორიებს და ფასებს ბაზიდან წამოვიღებთ.
            </p>
          </div>

          <a href="#" className="btn-outline w-fit">
            ყველა კატეგორია
          </a>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <article
              key={category.title}
              className="group premium-card relative min-h-[250px] overflow-hidden p-6 transition hover:-translate-y-1 hover:border-brand-gold/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-70" />
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-orange/10 blur-2xl transition group-hover:bg-brand-orange/20" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-6xl font-black text-white/5">
                    0{index + 1}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition group-hover:bg-brand-orange group-hover:text-white">
                    <ArrowUpRight size={18} />
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {category.description}
                  </p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">
                    {category.count} items
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
