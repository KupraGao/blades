import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { kaBodyFont, kaHeadingFont } from "@/fonts/georgian";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blades Premium Store",
  description: "Premium ecommerce starter built with Next.js and Tailwind CSS.",
};

// Runs before paint. Empty or unknown storage stays dark; only an explicit
// "light" choice wins. Does not read prefers-color-scheme.
const themeInitScript = `(function(){try{var k="theme",s=localStorage.getItem(k),t=s==="light"?"light":"dark";if(s!=="light"&&s!=="dark"&&s!==null){localStorage.setItem(k,"dark")}var d=document.documentElement;if(t==="light"){d.classList.add("light");d.classList.remove("dark");d.style.colorScheme="light"}else{d.classList.add("dark");d.classList.remove("light");d.style.colorScheme="dark"}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ka"
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${barlowCondensed.variable} ${kaBodyFont.variable} ${kaHeadingFont.variable} bg-[#eeeeee] text-zinc-900 dark:bg-black dark:text-zinc-100 antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}