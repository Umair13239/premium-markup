import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

const base = () => siteConfig.url.replace(/\/$/, "");

// Per-page metadata with its own Open Graph / Twitter card. (A page that sets `openGraph` replaces the layout's whole
// object, so the image and site name are repeated here; without this every share card showed the home page title.)
export function pageMeta(o: { title: string; description: string; path: string; ogTitle?: string; image?: { url: string; alt: string } }): Metadata {
  const ogTitle = o.ogTitle || o.title;
  const image = { url: o.image?.url || "/generated/og.png", width: 1200, height: 630, alt: o.image?.alt || `${siteConfig.name} — ${siteConfig.tagline}` };
  return {
    title: { absolute: o.title },
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: { type: "website", siteName: siteConfig.name, title: ogTitle, description: o.description, url: o.path, images: [image] },
    twitter: { card: "summary_large_image", title: ogTitle, description: o.description, images: [image.url] },
  };
}

// Structured data. Only describes what is visibly on the page.
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem", position: i + 1, name: it.name, item: `${base()}${it.path === "/" ? "" : it.path}`,
    })),
  };
}
