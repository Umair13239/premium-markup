// Server-side image generation used by the admin Images manager. Mirrors
// scripts/gen-images.mjs but as a reusable module: generates with Qwen/Wan
// (primary) or Cloudflare Flux, with automatic fallback to the other, and
// overwrites public/generated/<name>.png. Node runtime only.
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const STYLE =
  "photorealistic, cinematic professional photography, moody dark tones, dramatic soft lighting, " +
  "shallow depth of field, subtle cool violet ambient light, premium high-end, ultra-detailed, realistic, " +
  "no text, no watermark, no logo";
const STYLE_CF =
  "photorealistic, cinematic professional photography, moody dark tones, dramatic soft lighting, " +
  "shallow depth of field, premium high-end, ultra-detailed, realistic, no text, no watermark, no logo";
const NEG =
  "text, watermark, logo, letters, words, lowres, blurry, distorted, deformed hands, extra fingers, cartoon, illustration, cgi, oversaturated, cheap stock photo";

type Result = { ok: boolean; err?: string; provider?: string; via?: string };

function httpReq(method: string, url: string, headers: Record<string, string>, body?: unknown): Promise<{ status: number; json: any }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const r = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method, headers: { ...headers, ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve({ status: res.statusCode || 0, json: (() => { try { return JSON.parse(d); } catch { return d; } })() })); }
    );
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}
const download = (url: string, dest: string) => new Promise<void>((resolve, reject) => {
  const f = fs.createWriteStream(dest);
  https.get(url, (res) => { res.pipe(f); f.on("finish", () => f.close(() => resolve())); }).on("error", reject);
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const outPath = (name: string) => {
  const dir = path.join(process.cwd(), "public", "generated");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${name}.png`);
};

async function genQwen(name: string, prompt: string): Promise<Result> {
  const KEY = process.env.QWEN_API_KEY;
  const BASE = (process.env.QWEN_DASHSCOPE_BASE || "").replace(/\/$/, "");
  const MODEL = process.env.QWEN_IMAGE_MODEL || "wan2.2-t2i-plus";
  if (!KEY || !BASE) return { ok: false, err: "Qwen not configured" };
  const submit = await httpReq("POST", `${BASE}/services/aigc/text2image/image-synthesis`,
    { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "X-DashScope-Async": "enable" },
    { model: MODEL, input: { prompt: `${prompt}. ${STYLE}`, negative_prompt: NEG }, parameters: { size: "1280*720", n: 1, prompt_extend: true } });
  const taskId = submit.json?.output?.task_id;
  if (!taskId) return { ok: false, err: (submit.json?.message || JSON.stringify(submit.json)).slice(0, 160) };
  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const poll = await httpReq("GET", `${BASE}/tasks/${taskId}`, { Authorization: `Bearer ${KEY}` });
    const st = poll.json?.output?.task_status;
    if (st === "SUCCEEDED") {
      const url = poll.json.output.results?.[0]?.url;
      if (!url) return { ok: false, err: "no image url" };
      await download(url, outPath(name));
      return { ok: true, provider: "qwen" };
    }
    if (st === "FAILED") return { ok: false, err: poll.json.output?.message || "generation failed" };
  }
  return { ok: false, err: "timeout" };
}

async function genCloudflare(name: string, prompt: string): Promise<Result> {
  const ACC = process.env.CLOUDFLARE_ACCOUNT_ID;
  const TOK = process.env.CLOUDFLARE_API_TOKEN;
  if (!ACC || !TOK) return { ok: false, err: "Cloudflare not configured" };
  const res = await httpReq("POST", `https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" },
    { prompt: `${prompt}. ${STYLE_CF}`, steps: 8 });
  const img = res.json?.result?.image;
  if (!img) return { ok: false, err: (JSON.stringify(res.json?.errors || res.json)).slice(0, 160) };
  fs.writeFileSync(outPath(name), Buffer.from(img, "base64"));
  return { ok: true, provider: "cloudflare" };
}

export async function generateImage({ name, prompt, provider = "qwen" }: { name: string; prompt: string; provider?: "qwen" | "cloudflare" }): Promise<Result> {
  const primary = provider === "cloudflare" ? genCloudflare : genQwen;
  const secondary = provider === "cloudflare" ? genQwen : genCloudflare;
  const safe = (fn: typeof primary) => fn(name, prompt).catch((e) => ({ ok: false, err: String(e?.message || e) }) as Result);
  const r = await safe(primary);
  if (r.ok) return r;
  const r2 = await safe(secondary);
  return r2.ok ? { ...r2, via: "fallback" } : { ok: false, err: r.err || r2.err };
}
