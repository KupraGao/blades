import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">

        {/* LOGO + DESCRIPTION */}
        <div>
          <div className="bg-white w-[120px] rounded-lg">
            <a href="/" aria-label="მთავარი გვერდი - Blades">
              <Image
                src="/images/fonis-gareshe-1.png"
                alt="Blades ლოგო"
                width={100}
                height={40}
                className="object-contain h-10 w-auto"
              />
            </a>
          </div>

          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
            Premium ecommerce starter. პროექტი მომზადებულია Next.js და Tailwind CSS-ით.
          </p>
        </div>

        {/* MENU */}
        <div>
          <h3 className="font-bold text-white">მენიუ</h3>

          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li>
              <a href="#" className="hover:text-white transition">
                კატალოგი
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-white transition">
                ბრენდები
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-white transition">
                ფასდაკლება
              </a>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-bold text-white">კონტაქტი</h3>

          <ul className="mt-4 space-y-3 text-sm text-zinc-400">

            <li>თბილისი, საქართველო</li>

            <li>
              <a
                href="mailto:info@example.ge"
                className="hover:text-white transition"
              >
                info@example.ge
              </a>
            </li>

            <li>
              <a
                href="tel:+995555000000"
                className="hover:text-white transition"
              >
                +995 555 00 00 00
              </a>
            </li>

          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10 py-5">
        <div className="container-page text-sm text-zinc-500">
          © 2026 Blades Premium Starter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}