import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { generateImage } from "@/lib/image-gen";
import { getSiteImage, siteImageExt } from "@/lib/site-images";

// Regenerate one site image from an admin prompt and replace it in place.
// Gated by the admin auth middleware (all /api/* except contact/auth).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, prompt, provider } = body as { name?: string; prompt?: string; provider?: "qwen" | "cloudflare" };

  const slot = name ? getSiteImage(name) : null;
  if (!slot) return NextResponse.json({ error: "Unknown image slot." }, { status: 400 });
  if (!prompt || prompt.trim().length < 4) return NextResponse.json({ error: "Please enter a prompt." }, { status: 400 });

  const r = await generateImage({ name: slot.name, prompt: prompt.trim(), provider: provider === "cloudflare" ? "cloudflare" : "qwen" });
  if (!r.ok) return NextResponse.json({ error: r.err || "Generation failed." }, { status: 502 });

  // The generator always writes <name>.png; for webp slots (services) convert
  // to <name>.webp so the page — which references .webp — picks up the change.
  const ext = siteImageExt(slot.name);
  const dir = path.join(process.cwd(), "public", "generated");
  if (ext === "webp") {
    const png = path.join(dir, `${slot.name}.png`);
    await sharp(png).webp({ quality: 82, effort: 4 }).toFile(path.join(dir, `${slot.name}.webp`));
    fs.rmSync(png, { force: true });
  }

  return NextResponse.json({
    ok: true,
    provider: r.provider,
    fallback: !!r.via,
    url: `/generated/${slot.name}.${ext}?v=${Date.now()}`,
  });
}
