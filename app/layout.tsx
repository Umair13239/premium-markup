import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "@/site.config";

// Gendy (logo/display), self-hosted for speed.
const gendy = localFont({
  src: "../public/fonts/gendy.woff2",
  variable: "--font-gendy",
  display: "swap",
});

// Body font. Poppins is a free geometric sans standing in for CocoGothic (the
// CocoGothic *trial* files carry a "ZETAFONTS.COM" watermark + non-commercial
// licence). Once the LICENSED CocoGothic is dropped in public/fonts, swap this
// to localFont({ src: [...cocogothic.woff2...] }) — one line.
const coco = Poppins({
  variable: "--font-coco",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/generated/og.png", width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/generated/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  // Google Search Console (URL-prefix property) site verification.
  verification: { google: "UA4BSmV1Rqpiwg-NarmgQcm0R_Sm4UsF6rSk6k8Y8vU" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${gendy.variable} ${coco.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Script id="pm-theme-init" strategy="beforeInteractive">
          {"(function(){var d=document.documentElement;try{d.setAttribute('data-theme',localStorage.getItem('theme')||'dark');}catch(e){d.setAttribute('data-theme','dark');}try{if(sessionStorage.getItem('pm_pre')==='1'){d.setAttribute('data-preloaded','');}else{sessionStorage.setItem('pm_pre','1');}}catch(e){}})();"}
        </Script>
        {children}
      </body>
    </html>
  );
}
