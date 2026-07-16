"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProjectInput = {
  name: string;
  slug?: string;
  sector: string;
  location: string;
  url: string;
  year: string;
  services: string;      // comma-separated
  summary: string;
  challenge: string;
  solution: string;      // one bullet per line
  resultsText: string;   // one "stat | label" per line
  image: string;
  status: string;        // draft | published
  featured: boolean;
  relatedService: string; // service slug or ""
  order: number;
  seoTitle: string;
  seoDescription: string;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "project";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ex = await prisma.project.findUnique({ where: { slug } });
    if (!ex || ex.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

function parseResults(text: string) {
  const rows = text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [stat, ...rest] = l.split("|");
    return { stat: (stat || "").trim(), label: rest.join("|").trim() };
  }).filter((r) => r.stat);
  return JSON.stringify(rows);
}

function fields(d: ProjectInput) {
  return {
    name: d.name.trim(),
    sector: d.sector.trim(),
    location: d.location.trim() || null,
    url: d.url.trim() || null,
    year: d.year.trim(),
    services: d.services.trim(),
    summary: d.summary.trim(),
    challenge: d.challenge.trim(),
    solution: d.solution.trim(),
    results: parseResults(d.resultsText),
    image: d.image.trim() || null,
    status: d.status === "published" ? "published" : "draft",
    featured: !!d.featured,
    relatedService: d.relatedService.trim() || null,
    order: Number.isFinite(d.order) ? Math.trunc(d.order) : 0,
    seoTitle: d.seoTitle.trim() || null,
    seoDescription: d.seoDescription.trim() || null,
  };
}

export async function createProject(d: ProjectInput) {
  const slug = await uniqueSlug(d.slug || d.name);
  const p = await prisma.project.create({ data: { slug, ...fields(d) } });
  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin/work");
  return { id: p.id, slug: p.slug };
}

export async function updateProject(id: string, d: ProjectInput) {
  const slug = await uniqueSlug(d.slug || d.name, id);
  const p = await prisma.project.update({ where: { id }, data: { slug, ...fields(d) } });
  revalidatePath("/work");
  revalidatePath(`/work/${p.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/work");
  return { id: p.id, slug: p.slug };
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin/work");
  return { ok: true };
}
