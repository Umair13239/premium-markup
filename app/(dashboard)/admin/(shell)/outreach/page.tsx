import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ComposeClient, type ComposeLead, type ComposeTemplate } from "@/components/admin/compose-client";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const [leadsRaw, templatesRaw] = await Promise.all([
    prisma.lead.findMany({
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: {
        id: true, name: true, company: true, email: true, website: true, niche: true,
        auditSlow: true, auditDated: true, auditNotMobile: true, auditNoSeo: true, auditNotes: true, status: true,
        message: true, budget: true, projectType: true,
      },
    }),
    prisma.template.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const leads: ComposeLead[] = leadsRaw;
  const templates: ComposeTemplate[] = templatesRaw.map((t) => ({
    id: t.id, name: t.name, kind: t.kind, subject: t.subject, body: t.body,
  }));

  if (!templates.length) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
        <h1 className="text-2xl">Compose outreach</h1>
        <p className="mt-3 text-sm text-muted">
          No templates yet. <Link href="/admin/templates" className="text-cobalt link-underline">Create one first →</Link>
        </p>
      </div>
    );
  }

  return <ComposeClient leads={leads} templates={templates} />;
}
