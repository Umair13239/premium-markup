import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// No SVG: an uploaded SVG can carry <script> and, served same-origin from
// /uploads, would execute in the site's origin (stored XSS).
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX = 8 * 1024 * 1024; // 8MB

// Saves an uploaded image to public/uploads and returns its URL.
// Gated behind admin auth by middleware. Swap for S3/R2 in production.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buf);

  return NextResponse.json({ url: `/uploads/${name}` });
}
