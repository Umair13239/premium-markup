import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getSiteImage, siteImageExt } from "@/lib/site-images";

// Replace a site image by uploading a file. The upload is inspected (size +
// dimensions), downscaled to a sensible max, and compressed to the best
// quality-per-byte in the slot's format (webp for services, png otherwise),
// then written in place so the page picks it up with no code change.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const kb = (n: number) => `${Math.round(n / 1024)} KB`;

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "No form data." }, { status: 400 });

  const name = String(form.get("name") || "");
  const file = form.get("file");
  const slot = name ? getSiteImage(name) : null;
  if (!slot) return NextResponse.json({ error: "Unknown image slot." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Image too large (max 25 MB)." }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = siteImageExt(slot.name);
  const dir = path.join(process.cwd(), "public", "generated");
  fs.mkdirSync(dir, { recursive: true });

  try {
    const meta = await sharp(buf).metadata();
    const srcW = meta.width || 0;
    const srcH = meta.height || 0;

    // Longest-side cap by role: the OG/social image stays 1280-wide; the hero
    // backdrop can be larger; everything else is display-capped at 1600.
    const maxSide = slot.name === "og" ? 1280 : slot.name === "hero-ambient" ? 1920 : 1600;

    // Adaptive quality — larger sources compress a touch harder to keep bytes
    // down while staying visually clean.
    const area = srcW * srcH;
    const q = area > 4_000_000 ? 76 : area > 1_500_000 ? 82 : 87;

    const pipe = sharp(buf).rotate().resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true });
    const out =
      ext === "webp"
        ? await pipe.webp({ quality: q, effort: 5 }).toBuffer()
        : await pipe.png({ compressionLevel: 9, palette: true, quality: 90, effort: 8 }).toBuffer();

    fs.writeFileSync(path.join(dir, `${slot.name}.${ext}`), out);
    // Drop any stale opposite-extension file so there's one source of truth.
    fs.rmSync(path.join(dir, `${slot.name}.${ext === "webp" ? "png" : "webp"}`), { force: true });

    const final = await sharp(out).metadata();
    return NextResponse.json({
      ok: true,
      url: `/generated/${slot.name}.${ext}?v=${Date.now()}`,
      info: `${final.width}×${final.height} · ${kb(out.length)} (from ${srcW}×${srcH}, ${kb(file.size)})`,
    });
  } catch {
    return NextResponse.json({ error: "Could not process that image." }, { status: 400 });
  }
}
