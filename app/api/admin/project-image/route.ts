import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/image-gen";

// Generate a project case-study image from a prompt (admin, gated by middleware).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { slug, prompt, provider } = (await req.json().catch(() => ({}))) as { slug?: string; prompt?: string; provider?: "qwen" | "cloudflare" };
  const clean = (slug || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  if (!clean) return NextResponse.json({ error: "Save the project name/slug first." }, { status: 400 });
  if (!prompt || prompt.trim().length < 4) return NextResponse.json({ error: "Please enter a prompt." }, { status: 400 });

  const name = `project-${clean}`;
  const r = await generateImage({ name, prompt: prompt.trim(), provider: provider === "cloudflare" ? "cloudflare" : "qwen" });
  if (!r.ok) return NextResponse.json({ error: r.err || "Generation failed." }, { status: 502 });

  return NextResponse.json({ ok: true, provider: r.provider, fallback: !!r.via, url: `/generated/${name}.png?v=${Date.now()}` });
}
