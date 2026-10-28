import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = ["", "/products", "/products/ai-receptionist", "/products/website-builder", "/products/seo-report", "/products/website-health", "/products/mockup-designer", "/pricing", "/how-it-works", "/blog", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const posts = await prisma.post.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }).catch(() => []);
  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
