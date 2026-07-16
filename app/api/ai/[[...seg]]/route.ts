import { NextRequest, NextResponse } from "next/server";
import { getLead } from "@/lib/portal/db";
import { aiStatus, aiEnabled, aiGenerate, buildPitchPrompt } from "@/lib/portal/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type P = { params: Promise<{ seg?: string[] }> };

export async function GET(_req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "status") { const a = aiStatus(); return NextResponse.json({ enabled: a.enabled, provider: a.provider, model: a.model }); }
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: P) {
  const { seg = [] } = await params;
  if (seg[0] === "pitch") {
    if (!aiEnabled()) return NextResponse.json({ error: "no_api_key" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const lead = getLead(body.id);
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });
    try {
      const p = buildPitchPrompt(lead, body.settings || {});
      const text = await aiGenerate(p.sys, p.usr, 400);
      if (!text) throw new Error("empty response from AI provider");
      return NextResponse.json({ pitch: text });
    } catch (e) {
      return NextResponse.json({ error: String((e as any)?.message || e) }, { status: 502 });
    }
  }
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}
