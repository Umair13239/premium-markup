import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  // Real change dates for the pages that changed recently, so Google re-crawls them when they do change.
  // Everything else keeps today's date, which is the honest default for a page the site rebuilds on deploy.
  const changed: Record<string, string> = {
    "/products": "2026-10-29",
    "/products/website-health": "2026-10-29",
    "/products/ai-receptionist": "2026-10-28",
    "/products/website-builder": "2026-10-28",
    "/products/seo-report": "2026-10-28",
    "/products/mockup-designer": "2026-10-28",
  };
  const staticRoutes = ["", "/products", "/products/ai-receptionist", "/products/website-builder", "/products/seo-report", "/products/website-health", "/products/mockup-designer", "/pricing", "/how-it-works", "/blog", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    lastModified: changed[p] ? new Date(changed[p]) : now,
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

  // the AI map files, so assistants find them through the sitemap too
  const aiRoutes = ["/llms.txt", "/llms-full.txt"].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 }));

  return [...staticRoutes, ...blogRoutes, ...aiRoutes];
}
