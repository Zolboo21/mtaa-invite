import type { Metadata } from "next";
import { Montserrat, Inter_Tight, JetBrains_Mono, Cormorant_Garamond, Bad_Script } from "next/font/google";
import { event } from "@/data/event";
import "./globals.css";

// Брэндийн фонт (logo guideline): Montserrat — Кирилл дэмжлэгтэй
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Display face for big numbers and years: lining, tabular figures
const display = Inter_Tight({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Урилгын гар бичмэл мөр — холбоот бичиг (Ө ө Ү ү бүгд фонтод өөрт нь бий)
const script = Bad_Script({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

// Зочны нэр — сонгодог serif, Ө/Ү (cyrillic-ext) бүрэн
const nameFont = Cormorant_Garamond({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["600", "700"],
  variable: "--font-name",
  display: "swap",
});

// [ ШОШГО ] маягийн жижиг mono бичвэр
const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${event.deptShort} · ${event.years} жил`,
  description: `${event.dept}, ${event.org}. ${event.years} жилийн ойн урилга.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className={`${montserrat.variable} ${display.variable} ${mono.variable} ${nameFont.variable} ${script.variable}`}>{children}</body>
    </html>
  );
}
