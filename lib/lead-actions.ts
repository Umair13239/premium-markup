"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function refresh() {
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function setStatus(id: string, status: string) {
  await prisma.lead.update({ where: { id }, data: { status, unread: false } });
  refresh();
}

export async function setFollowUp(id: string, dateISO: string | null) {
  await prisma.lead.update({
    where: { id },
    data: { nextFollowUpDate: dateISO ? new Date(dateISO) : null },
  });
  refresh();
}

export async function addNote(id: string, body: string) {
  const text = body.trim();
  if (!text) return;
  await prisma.note.create({ data: { leadId: id, body: text } });
  refresh();
}

export async function deleteNote(noteId: string) {
  await prisma.note.delete({ where: { id: noteId } });
  refresh();
}

export async function markRead(id: string) {
  await prisma.lead.update({ where: { id }, data: { unread: false } });
  refresh();
}

const EDITABLE = ["name", "company", "email", "phone", "website", "niche", "tags", "budget", "projectType"] as const;

export async function updateLead(id: string, patch: Record<string, string>) {
  const data: Record<string, string> = {};
  for (const k of EDITABLE) if (k in patch) data[k] = patch[k];
  if (Object.keys(data).length === 0) return;
  await prisma.lead.update({ where: { id }, data });
  refresh();
}

const RESEARCH = ["hasSsl", "mobileFriendly", "pageSpeedNote", "socialsFound", "auditSlow", "auditDated", "auditNotMobile", "auditNoSeo", "auditNotes"] as const;

export async function updateResearch(id: string, patch: Record<string, boolean | string | null>) {
  const data: Record<string, boolean | string | null> = {};
  for (const k of RESEARCH) if (k in patch) data[k] = patch[k];
  if (Object.keys(data).length === 0) return;
  await prisma.lead.update({ where: { id }, data });
  refresh();
}

function normKey(s?: string | null) {
  return (s || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export async function importLeads(records: Record<string, string>[]) {
  const existing = await prisma.lead.findMany({ select: { email: true, website: true } });
  const seen = new Set<string>();
  for (const e of existing) {
    if (e.email) seen.add("e:" + normKey(e.email));
    if (e.website) seen.add("w:" + normKey(e.website));
  }
  let added = 0;
  let dupes = 0;
  for (const r of records) {
    const name = (r.name || "").trim();
    if (!name) continue;
    const ek = r.email ? "e:" + normKey(r.email) : null;
    const wk = r.website ? "w:" + normKey(r.website) : null;
    if ((ek && seen.has(ek)) || (wk && seen.has(wk))) {
      dupes++;
      continue;
    }
    if (ek) seen.add(ek);
    if (wk) seen.add(wk);
    await prisma.lead.create({
      data: {
        name,
        company: r.company || null,
        email: r.email || null,
        phone: r.phone || null,
        website: r.website || null,
        niche: r.niche || null,
        source: "imported",
        status: "New",
      },
    });
    added++;
  }
  refresh();
  return { added, dupes };
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  refresh();
}

export async function createLead(patch: Record<string, string>) {
  const name = (patch.name || "").trim();
  if (!name) return { error: "Name is required" };
  await prisma.lead.create({
    data: {
      name,
      company: patch.company || null,
      email: patch.email || null,
      website: patch.website || null,
      niche: patch.niche || null,
      message: patch.notes || null,
      source: "manual",
      status: "New",
    },
  });
  refresh();
  return { ok: true };
}
