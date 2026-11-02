import type { Metadata } from "next";
import { Montserrat, Inter_Tight, JetBrains_Mono, Caveat } from "next/font/google";
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

// Гар бичмэл мэт урилгын мөр — Ө, Ү (cyrillic-ext) бүрэн дэмждэг
const hand = Caveat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["500", "600"],
  variable: "--font-hand",
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
      <body className={`${montserrat.variable} ${display.variable} ${mono.variable} ${hand.variable}`}>{children}</body>
    </html>
  );
}
