import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/home/product-detail";
import { products, productBySlug } from "@/lib/products";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";

export const dynamicParams = false; // only the products in lib/products.ts

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return pageMeta({ title: `${p.name} | Premium Markup`, description: p.description, path: `/products/${p.slug}` });
}

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={breadcrumb([{ name: "Products", path: "/products" }, { name: p.name, path: `/products/${p.slug}` }])} />
      <ProductDetail slug={p.slug} />
    </>
  );
}
