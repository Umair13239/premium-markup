import type { Metadata } from "next";
import { ProductsPage } from "@/components/home/products-page";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  image: { url: "/og/products.png", alt: "Premium Markup products: five tools in one portal" },
  title: "Products | Premium Markup",
  description: "Five tools inside the Leads Portal: an AI receptionist, a website builder, SEO reports, website health checks and brand mockups.",
  path: "/products",
});

export default function ProductsRoute() {
  return (
    <>
      <JsonLd data={breadcrumb([{ name: "Products", path: "/products" }])} />
      <ProductsPage />
    </>
  );
}
