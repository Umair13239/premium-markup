import type { Metadata } from "next";
import Script from "next/script";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/site.config";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
      className={`${archivo.variable} ${plexMono.variable} h-full`}
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
