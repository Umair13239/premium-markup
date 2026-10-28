import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/home/product-detail";
import { products, productBySlug, portalLink } from "@/lib/products";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";
import { siteConfig } from "@/site.config";

export const dynamicParams = false; // only the products in lib/products.ts

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return pageMeta({
    title: `${p.seoTitle || p.name} | Premium Markup`,
    description: p.description,
    path: `/products/${p.slug}`,
    image: p.media?.og ? { url: p.media.og, alt: `${p.name}: ${p.description}` } : undefined,
  });
}

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/products/${p.slug}`;
  // Structured data describes only what is on the page: the app, its free tier, the FAQ and the film.
  const data: object[] = [
    breadcrumb([{ name: "Products", path: "/products" }, { name: p.name, path: `/products/${p.slug}` }]),
    {
      "@context": "https://schema.org", "@type": "SoftwareApplication", name: `${p.name} by Premium Markup`, url,
      applicationCategory: "BusinessApplication", operatingSystem: "Web", description: p.lede, installUrl: portalLink(p),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: p.pricing ? p.pricing.free.join("; ") : "Free to start" },
      ...(p.media?.og ? { image: `${base}${p.media.og}` } : {}),
      ...(p.media?.shots.length ? { screenshot: p.media.shots.map((s) => `${base}${s.src}`) } : {}),
      publisher: { "@type": "Organization", name: siteConfig.name, url: base },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  if (p.media?.film) {
    data.push({
      "@context": "https://schema.org", "@type": "VideoObject", name: `${p.name}: how it works`, description: p.media.film.alt,
      thumbnailUrl: `${base}${p.media.dir}/film-poster.webp`, contentUrl: `${base}${p.media.dir}/film-loop.mp4`, uploadDate: "2026-10-28",
    });
  }
  return (
    <>
      <JsonLd data={data} />
      <ProductDetail slug={p.slug} />
    </>
  );
}
