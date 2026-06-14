import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="section-pad">

      <div className="container-page">

        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border

            border-zinc-200
            bg-gradient-to-r
            from-white
            via-zinc-50
            to-orange-100

            dark:border-brand-gold/20
            dark:from-zinc-950
            dark:via-zinc-900
            dark:to-orange-950

            p-8
            shadow-premium
            sm:p-12
          "
        >

          <div
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-brand-orange/20
              blur-3xl
            "
          />

          <div className="relative max-w-2xl">

            <p className="small-label">
              limited offer
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-3xl
                font-black

                text-zinc-900

                dark:text-white

                sm:text-5xl
              "
            >
              შექმნილი როგორც რეალური ონლაინ მაღაზიის საწყისი პლატფორმა
            </h2>

            <p
              className="
                mt-5
                text-sm
                leading-7

                text-zinc-700

                dark:text-zinc-300

                sm:text-base
              "
            >
              შემდეგ ეტაპზე დავამატებთ product details გვერდს, cart ლოგიკას, checkout flow-ს და backend-ს.
            </p>

            <a
              href="#"
              className="btn-primary mt-8 gap-2"
            >
              შემდეგი ეტაპი

              <ArrowRight size={18} />
            </a>

          </div>

        </div>

      </div>

    </section>
  );
}