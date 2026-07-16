import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public (contact form) — clients attach a project brief / reference files.
// Kept deliberately narrow: a short allow-list of document/image types and a
// 10MB cap. Lives under /api/contact/* so it stays outside the admin auth gate.
const ALLOWED: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "text/plain": "txt",
};
const MAX = 10 * 1024 * 1024; // 10MB

// Very light per-instance rate limit so the public endpoint can't be flooded.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, { count: number; start: number }>();
function limited(ip: string) {
  const now = Date.now();
  const r = hits.get(ip);
  if (!r || now - r.start > WINDOW_MS) { hits.set(ip, { count: 1, start: now }); return false; }
  r.count += 1; return r.count > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many uploads — try again in a minute." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Unsupported file type. Use PDF, image, Word, TXT or ZIP." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File too large (max 10MB)." }, { status: 400 });

  const dir = path.join(process.cwd(), "public", "uploads", "briefs");
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  // Keep the original filename (sanitised) so the admin sees a human label.
  const original = (file.name || "brief").replace(/[^\w.\- ]+/g, "").slice(0, 120);
  return NextResponse.json({ url: `/uploads/briefs/${name}`, name: original });
}
