import type { Metadata } from "next";
import { ProductsPage } from "@/components/home/products-page";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Products | Premium Markup",
  description: "Explore Premium Markup's focused tools for mockups, website health, website building and client-ready SEO reports.",
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
