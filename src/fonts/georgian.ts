import localFont from "next/font/local";

export const kaBodyFont = localFont({
  src: "./bpg_glaho_sylfaen.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-ka-body",
});

export const kaHeadingFont = localFont({
  src: "./bpg_nino_mtavruli_bold.ttf",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-ka-heading",
});
