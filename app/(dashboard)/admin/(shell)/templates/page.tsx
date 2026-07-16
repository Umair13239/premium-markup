import { prisma } from "@/lib/prisma";
import { TemplatesClient, type TemplateDTO } from "@/components/admin/templates-client";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: "asc" } });
  const dto: TemplateDTO[] = templates.map((t) => ({
    id: t.id, name: t.name, kind: t.kind, subject: t.subject, body: t.body,
  }));
  return <TemplatesClient templates={dto} />;
}
