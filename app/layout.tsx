import type { Metadata } from "next";
import { Montserrat, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { event } from "@/data/event";
import "./globals.css";

// Брэндийн фонт (logo guideline): Montserrat — Кирилл дэмжлэгтэй
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Editorial italic numerals (он, дугаар)
const serif = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  style: ["italic"],
  weight: ["400", "700"],
  variable: "--font-serif",
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
      <body className={`${montserrat.variable} ${serif.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
