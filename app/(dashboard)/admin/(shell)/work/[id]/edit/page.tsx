import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectEditor, type ProjectFormData } from "@/components/admin/project-editor";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) notFound();

  let resultsText = "";
  try {
    const r = JSON.parse(p.results || "[]");
    if (Array.isArray(r)) resultsText = r.map((x: { stat: string; label: string }) => `${x.stat} | ${x.label}`).join("\n");
  } catch { /* */ }

  const initial: ProjectFormData = {
    id: p.id, name: p.name, slug: p.slug, sector: p.sector, location: p.location || "", url: p.url || "",
    year: p.year, services: p.services, summary: p.summary, challenge: p.challenge, solution: p.solution,
    resultsText, image: p.image || "", status: p.status, featured: p.featured, relatedService: p.relatedService || "", order: p.order,
    seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "",
  };
  return <ProjectEditor initial={initial} />;
}
