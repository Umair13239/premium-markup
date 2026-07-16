import { prisma } from "@/lib/prisma";

// Serializable shape the public Work components consume.
export type ProjectDTO = {
  id: string;
  slug: string;
  name: string;
  sector: string;
  location: string | null;
  url: string | null;
  year: string;
  services: string[];
  summary: string;
  challenge: string;
  solution: string[];
  results: { stat: string; label: string }[];
  image: string | null;
  featured: boolean;
  relatedService: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

type Row = {
  id: string; slug: string; name: string; sector: string; location: string | null; url: string | null;
  year: string; services: string; summary: string; challenge: string; solution: string; results: string;
  image: string | null; featured: boolean; relatedService: string | null; status: string; seoTitle: string | null; seoDescription: string | null;
};

function toDTO(p: Row): ProjectDTO {
  let results: { stat: string; label: string }[] = [];
  try { const r = JSON.parse(p.results || "[]"); if (Array.isArray(r)) results = r; } catch { /* */ }
  return {
    id: p.id, slug: p.slug, name: p.name, sector: p.sector, location: p.location, url: p.url, year: p.year,
    services: p.services ? p.services.split(",").map((s) => s.trim()).filter(Boolean) : [],
    summary: p.summary, challenge: p.challenge,
    solution: p.solution ? p.solution.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    results, image: p.image, featured: p.featured, relatedService: p.relatedService, status: p.status,
    seoTitle: p.seoTitle, seoDescription: p.seoDescription,
  };
}

export async function getPublishedProjects(): Promise<ProjectDTO[]> {
  const rows = await prisma.project.findMany({ where: { status: "published" }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return rows.map((r) => toDTO(r as Row));
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  const row = await prisma.project.findFirst({ where: { slug, status: "published" } });
  return row ? toDTO(row as Row) : null;
}

// Homepage showcase — projects flagged featured (falls back to the most recent).
export async function getFeaturedProjects(limit = 6): Promise<ProjectDTO[]> {
  const all = await getPublishedProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

// Related work shown on a given service page.
export async function getProjectsForService(serviceSlug: string, limit = 3): Promise<ProjectDTO[]> {
  const all = await getPublishedProjects();
  return all.filter((p) => p.relatedService === serviceSlug).slice(0, limit);
}
