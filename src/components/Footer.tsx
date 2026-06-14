import Image from "next/image";

export function Footer() {
  return (
    <footer
      className="
        border-t border-zinc-200
        bg-zinc-50

        dark:border-white/10
        dark:bg-black/50
      "
    >
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">

        {/* LOGO + DESCRIPTION */}

        <div>

          <div className="bg-white w-[120px] rounded-lg">
            <a
              href="/"
              aria-label="მთავარი გვერდი - Blades"
            >
              <Image
                src="/images/fonis-gareshe-1.png"
                alt="Blades ლოგო"
                width={100}
                height={40}
                className="
                  object-contain
                  h-10
                  w-auto
                "
              />
            </a>
          </div>

          <p
            className="
              mt-4
              max-w-md
              text-sm
              leading-7

              text-zinc-600
              dark:text-zinc-400
            "
          >
            Premium ecommerce starter.
            პროექტი მომზადებულია
            Next.js და Tailwind CSS-ით.
          </p>

        </div>

        {/* MENU */}

        <div>

          <h3
            className="
              font-bold
              text-zinc-900

              dark:text-white
            "
          >
            მენიუ
          </h3>

          <ul
            className="
              mt-4
              space-y-3
              text-sm

              text-zinc-600
              dark:text-zinc-400
            "
          >

            <li>
              <a
                href="#"
                className="
                  transition

                  hover:text-zinc-900
                  dark:hover:text-white
                "
              >
                კატალოგი
              </a>
            </li>

            <li>
              <a
                href="#"
                className="
                  transition

                  hover:text-zinc-900
                  dark:hover:text-white
                "
              >
                ბრენდები
              </a>
            </li>

            <li>
              <a
                href="#"
                className="
                  transition

                  hover:text-zinc-900
                  dark:hover:text-white
                "
              >
                ფასდაკლება
              </a>
            </li>

          </ul>

        </div>

        {/* CONTACT */}

        <div>

          <h3
            className="
              font-bold
              text-zinc-900

              dark:text-white
            "
          >
            კონტაქტი
          </h3>

          <ul
            className="
              mt-4
              space-y-3
              text-sm

              text-zinc-600
              dark:text-zinc-400
            "
          >

            <li>
              თბილისი, საქართველო
            </li>

            <li>
              <a
                href="mailto:info@example.ge"
                className="
                  transition

                  hover:text-zinc-900
                  dark:hover:text-white
                "
              >
                info@example.ge
              </a>
            </li>

            <li>
              <a
                href="tel:+995555000000"
                className="
                  transition

                  hover:text-zinc-900
                  dark:hover:text-white
                "
              >
                +995 555 00 00 00
              </a>
            </li>

          </ul>

        </div>

      </div>

      {/* COPYRIGHT */}

      <div
        className="
          border-t border-zinc-200
          py-5

          dark:border-white/10
        "
      >
        <div
          className="
            container-page
            text-sm

            text-zinc-600
            dark:text-zinc-500
          "
        >
          © 2026 Blades Premium Starter.
          All rights reserved.
        </div>
      </div>

    </footer>
  );
}