import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { services } from "@/lib/services";
import { getPublishedProjects } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = ["", "/services", "/work", "/about", "/process", "/blog", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const projects = await getPublishedProjects().catch(() => []);
  const workRoutes = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const posts = await prisma.post.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }).catch(() => []);
  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...workRoutes, ...blogRoutes];
}
