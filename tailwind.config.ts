import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#f97316",
          gold: "#d6a84f",
          dark: "#09090b",
          panel: "#111113",
          soft: "#18181b",
        },
      },

      boxShadow: {
        premium:
          "0 20px 60px rgba(0,0,0,.35)",
      },

      backgroundImage: {
        "radial-premium":
          "radial-gradient(circle at 20% 20%, rgba(249,115,22,.22), transparent 35%), radial-gradient(circle at 80% 30%, rgba(214,168,79,.16), transparent 30%)",
      },
    },
  },

  plugins: [],
};

export default config;