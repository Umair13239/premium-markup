import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { aiStatus } from "@/lib/portal/ai";
import { startSingle, startPipeline, stopJob, collectStatus, jobFile } from "@/lib/portal/collect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type P = { params: Promise<{ seg?: string[] }> };

export async function GET(_req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "config") { const a = aiStatus(); return NextResponse.json({ ai_ready: a.enabled, provider: a.provider, model: a.model }); }
  if (seg[0] === "status" && seg[1]) { const s = collectStatus(seg[1]); return s ? NextResponse.json(s) : NextResponse.json({ error: "unknown job" }, { status: 404 }); }
  if (seg[0] === "download" && seg[1] && seg[2]) {
    const p = jobFile(seg[1], seg[2]);
    if (!p || !fs.existsSync(p)) return new NextResponse("not found", { status: 404 });
    const buf = fs.readFileSync(p);
    return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": seg[2] === "csv" ? "text/csv" : "application/json", "Content-Disposition": 'attachment; filename="' + path.basename(p) + '"' } });
  }
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "scrape") { const body = await req.json().catch(() => ({})); const r = startSingle(body); return NextResponse.json(r, { status: r.error ? 400 : 200 }); }
  if (seg[0] === "pipeline") { const body = await req.json().catch(() => ({})); const r = startPipeline(body, req.nextUrl.origin); return NextResponse.json(r, { status: r.error ? 400 : 200 }); }
  if (seg[0] === "stop" && seg[1]) return NextResponse.json(stopJob(seg[1]));
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}
