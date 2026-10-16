import type { Metadata } from "next";
import { Fraunces, Manrope, Caveat } from "next/font/google";
import { KritikaClient } from "./kritika-client";

// Fraunces is a variable font: no fixed weight list (400, 500 and 600 all still work). A weight list together
// with italics made the Vercel (Turbopack) build fail to resolve the font files.
const display = Fraunces({
  variable: "--font-kr-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-kr-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const script = Caveat({
  variable: "--font-kr-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Not linked from anywhere on the site and deliberately kept out of search —
// reachable only by whoever has the direct URL.
export const metadata: Metadata = {
  title: "For Kritika",
  description: "A little something, just for you.",
  robots: { index: false, follow: false, nocache: true },
};

export default function KritikaPage() {
  return (
    <div className={`${display.variable} ${body.variable} ${script.variable}`}>
      <KritikaClient />
    </div>
  );
}
