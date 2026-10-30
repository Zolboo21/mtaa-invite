import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { event } from "@/data/event";
import "./globals.css";

// Брэндийн фонт (logo guideline): Montserrat — Кирилл дэмжлэгтэй
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
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
      <body className={montserrat.variable}>{children}</body>
    </html>
  );
}
