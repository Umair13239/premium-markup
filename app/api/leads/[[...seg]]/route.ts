import { NextRequest, NextResponse } from "next/server";
import * as d from "@/lib/portal/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type P = { params: Promise<{ seg?: string[] }> };

export async function GET(_req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg.length === 0) return NextResponse.json({ leads: d.allLeads() });
  const id = decodeURIComponent(seg[0]);
  if (seg[1] === "notes") return NextResponse.json({ notes: (d.getLead(id) as any)?.notes || [] });
  const l = d.getLead(id);
  return l ? NextResponse.json(l) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  const body = await req.json().catch(() => ({}));
  if (seg[0] === "bulk") {
    const r = d.bulkInsert(Array.isArray(body.leads) ? body.leads : []);
    return NextResponse.json({ ...r, total: d.count() });
  }
  if (seg[1] === "notes") {
    const note = d.addNote(decodeURIComponent(seg[0]), body.body);
    return note ? NextResponse.json(note) : NextResponse.json({ error: "lead not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (!seg[0]) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const l = d.patchLead(decodeURIComponent(seg[0]), body);
  return l ? NextResponse.json(l) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "imported") return NextResponse.json(d.deleteImported());
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}
