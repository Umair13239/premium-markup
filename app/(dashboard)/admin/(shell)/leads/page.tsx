import { prisma } from "@/lib/prisma";
import { LeadsClient, type LeadDTO } from "@/components/admin/leads-client";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;

  const leads = await prisma.lead.findMany({
    orderBy: [{ unread: "desc" }, { createdAt: "desc" }],
    include: { notes: { orderBy: { createdAt: "asc" } } },
  });

  const dto: LeadDTO[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    email: l.email,
    phone: l.phone,
    website: l.website,
    niche: l.niche,
    tags: l.tags,
    source: l.source,
    status: l.status,
    budget: l.budget,
    projectType: l.projectType,
    message: l.message,
    attachmentUrl: l.attachmentUrl,
    attachmentName: l.attachmentName,
    unread: l.unread,
    createdAt: l.createdAt.toISOString(),
    nextFollowUpDate: l.nextFollowUpDate ? l.nextFollowUpDate.toISOString() : null,
    hasSsl: l.hasSsl, mobileFriendly: l.mobileFriendly, pageSpeedNote: l.pageSpeedNote, socialsFound: l.socialsFound,
    auditSlow: l.auditSlow, auditDated: l.auditDated, auditNotMobile: l.auditNotMobile, auditNoSeo: l.auditNoSeo, auditNotes: l.auditNotes,
    notes: l.notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString() })),
  }));

  return <LeadsClient leads={dto} openId={open} />;
}
