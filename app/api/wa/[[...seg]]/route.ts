import { NextRequest, NextResponse } from "next/server";
import * as d from "@/lib/portal/db";
import { waNumbers, waProgress, startWaBackground } from "@/lib/portal/wa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type P = { params: Promise<{ seg?: string[] }> };

export async function GET(_req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "numbers") { const rows = waNumbers(); return NextResponse.json({ type: "whatsapp-numbers", count: rows.length, numbers: rows }); }
  if (seg[0] === "progress") return NextResponse.json(waProgress());
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "results") { const body = await req.json().catch(() => ({})); const arr = Array.isArray(body) ? body : (body.results || []); return NextResponse.json({ applied: d.applyWaResults(arr) }); }
  if (seg[0] === "reload") return NextResponse.json({ applied: d.loadWaFromDisk() });
  if (seg[0] === "start") { const r = startWaBackground(req.nextUrl.origin); return NextResponse.json({ started: r.started, reason: r.reason || "", ...waProgress() }); }
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}
