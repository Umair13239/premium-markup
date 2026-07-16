"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function refresh() {
  revalidatePath("/admin/templates");
  revalidatePath("/admin/outreach");
}

export async function createTemplate(data: { name: string; kind: string; subject?: string; body: string }) {
  if (!data.name.trim() || !data.body.trim()) return { error: "Name and body are required" };
  await prisma.template.create({
    data: { name: data.name.trim(), kind: data.kind || "cold-email", subject: data.subject || null, body: data.body },
  });
  refresh();
  return { ok: true };
}

export async function updateTemplate(id: string, data: { name?: string; kind?: string; subject?: string; body?: string }) {
  await prisma.template.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.kind !== undefined ? { kind: data.kind } : {}),
      ...(data.subject !== undefined ? { subject: data.subject || null } : {}),
      ...(data.body !== undefined ? { body: data.body } : {}),
    },
  });
  refresh();
}

export async function deleteTemplate(id: string) {
  await prisma.template.delete({ where: { id } });
  refresh();
}
